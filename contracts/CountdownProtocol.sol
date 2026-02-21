// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CountdownProtocol (GameCore)
 * @notice 倒计时协议主合约：买卖 CDT 代币、倒计时机制、开奖分配
 * @dev Phase 1 自建模式：代币由 owner 提供，买卖通过 buy/sell 完成
 *      Phase 2 蝴蝶内盘：通过 recordTrade 同步链外买卖的倒计时与开奖资格
 */

import "@openzeppelin/contracts/access/Ownable.sol";

/// @notice ERC20 代币接口（transfer/transferFrom/balanceOf）
interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract GameCore is Ownable {
    // ==================== 代币与税费 ====================
    IERC20 public immutable token;           // CDT 代币合约地址

    uint256 public constant FEE_RATE = 3;   // 税费率 3%，100% 进奖池
    uint256 public constant ROLL_OVER_RATE = 80;  // 奖池滚存比例（当前开奖逻辑中 80% 滚存）

    // ==================== 交易与持仓参数 ====================
    uint256 public constant MIN_TRADE_BNB = 0.001 ether;   // 最小买入金额 0.001 BNB
    uint256 public constant MIN_HOLD = 5000 * 10**18;      // 参与开奖最低持仓 5000 CDT
    uint256 public constant RATE_BASE = 1000;              // 汇率基数：1 BNB = 1000 CDT（按 BNB_UNIT 换算）
    uint256 public constant BNB_UNIT = 0.001 ether;        // BNB 单位，用于汇率计算

    // ==================== 倒计时参数 ====================
    uint256 public countdown;                        // 当前剩余秒数（可变）
    uint256 public constant INIT_COUNTDOWN = 10 * 60; // 初始倒计时 10 分钟
    uint256 public constant MAX_COUNTDOWN = 200 * 60; // 倒计时上限 200 分钟
    uint256 public constant BASE_BUY_REDUCE = 60;   // 首次买入减少 60 秒
    uint256 public constant COOL_DOWN = 120;         // 冷却窗口 2 分钟，2 分钟后重新从 60 秒开始
    uint256 public constant SELL_ADD = 60;           // 每次卖出增加 60 秒

    // ==================== 爆率（开奖权重）参数 ====================
    uint256 public constant BASE_RATE = 50;   // 基础爆率 50（5%）
    uint256 public constant BUY_BOOST = 20;  // 每笔买单 +20（+2%）
    uint256 public constant MAX_RATE = 500;   // 爆率上限 500（50%）

    // ==================== 买入冷却递减（2 分钟内） ====================
    mapping(address => uint256) public userCoolDownStartTime;  // 用户冷却开始时间戳
    mapping(address => uint256) public userLastBuyReduce;     // 上次买入减少量，下次减半（60→30→15→7→3→1）
    mapping(address => uint256) public userRate;               // 用户爆率（开奖权重）

    // ==================== 轮次与奖池 ====================
    uint256 public currentRound;                              // 当前轮次 ID
    uint256 public prizePoolBNB;                            // 奖池 BNB 余额
    mapping(address => bool) public hasJoined;                // 用户是否已加入本轮
    mapping(uint256 => address[]) public roundUsers;          // 每轮参与用户列表
    mapping(uint256 => mapping(address => bool)) public roundHasBought;  // 每轮用户是否买过
    mapping(uint256 => uint256) public roundBuyerCount;       // 每轮买单人数
    bool public inDraw;                                      // 是否正在开奖（防重入）

    /// @notice 开奖详情：大奖/小奖/阳光奖、滚存金额
    struct DrawDetail {
        address bigWinner;              // 大奖得主
        uint256 bigPrize;               // 大奖金额（60% 分配额）
        uint256 bigWinnerRate;           // 大奖得主爆率
        address[] smallWinners;          // 小奖得主列表（30% 分配额）
        uint256 smallPrizePerPerson;     // 小奖人均金额
        uint256[] smallWinnerRates;      // 小奖得主爆率
        address[] sunshineWinners;       // 阳光奖得主（10% 分配额，未中大奖/小奖的参与者）
        uint256 sunshinePerPerson;      // 阳光奖人均金额
        uint256[] sunshineWinnerRates;  // 阳光奖得主爆率
        uint256 rollOverAmount;         // 滚存到下一轮的金额
        bool isFinished;                // 是否已开奖完成
    }

    mapping(uint256 => DrawDetail) public roundDrawDetail;  // 每轮开奖详情

    // ==================== 事件 ====================
    event Countdown(uint256 sec);                           // 倒计时变化
    event PrizePool(uint256 bnb);                           // 奖池变化
    event Round(uint256 round);                             // 新轮开始
    event DrawFinished(uint256 roundId, address bigWinner);  // 开奖完成
    event Bought(address indexed user, uint256 bnbAmount, uint256 cdtAmount);  // 买入记录
    event Sold(address indexed user, uint256 cdtAmount, uint256 bnbAmount);    // 卖出记录

    /// @notice 构造函数，绑定 CDT 代币合约
    /// @param token_ CDT 代币合约地址
    constructor(address token_) Ownable(msg.sender) {
        token = IERC20(token_);
        countdown = INIT_COUNTDOWN;
        currentRound = 1;
    }

    /// @notice 买入：用户发送 BNB，获得 CDT 代币
    /// @dev 汇率：1 BNB = 1000 CDT（按 0.001 BNB 单位换算）；3% 税进奖池；需 owner 已 approve 本合约
    function buy() external payable {
        require(msg.value >= MIN_TRADE_BNB, "Min 0.001 BNB");

        uint256 getCdt = (msg.value * RATE_BASE * 1e18) / BNB_UNIT;  // 1 BNB = 1000 CDT
        token.transferFrom(owner(), msg.sender, getCdt);

        uint256 fee = (msg.value * FEE_RATE) / 100;  // 3% 税
        prizePoolBNB += fee;
        emit PrizePool(prizePoolBNB);
        emit Bought(msg.sender, msg.value, getCdt);

        _afterTrade(msg.sender, true);
    }

    /// @notice 卖出：用户转 CDT 进合约，合约返还 BNB
    /// @param cdtAmount 卖出 CDT 数量（最小 1000 CDT）
    /// @dev 3% 税进奖池；需用户先 approve 本合约
    function sell(uint256 cdtAmount) external {
        require(cdtAmount >= RATE_BASE * 1e18, "Min 1000 CDT");
        token.transferFrom(msg.sender, address(this), cdtAmount);

        uint256 outBnb = (cdtAmount * BNB_UNIT) / (RATE_BASE * 1e18);
        uint256 fee = (outBnb * FEE_RATE) / 100;
        uint256 actual = outBnb - fee;

        require(address(this).balance >= actual, "No liquidity");
        (bool ok, ) = payable(msg.sender).call{value: actual, gas: 30000}("");
        require(ok, "Sell failed");

        prizePoolBNB += fee;
        emit PrizePool(prizePoolBNB);
        emit Sold(msg.sender, cdtAmount, actual);

        _afterTrade(msg.sender, false);
    }

    /// @notice 蝴蝶内盘买卖后由 DApp/中继调用，同步倒计时与开奖资格（Phase 2 用）
    /// @param user 交易用户地址
    /// @param isBuy true=买入，false=卖出
    function recordTrade(address user, bool isBuy) external {
        _afterTrade(user, isBuy);
    }

    /// @notice 买卖后统一处理：倒计时、爆率、参与名单、触发开奖
    function _afterTrade(address user, bool isBuy) internal {
        if (isBuy) {
            _buyCountdownGlobal(user);
            if (!roundHasBought[currentRound][user]) {
                roundHasBought[currentRound][user] = true;
                roundBuyerCount[currentRound]++;
            }
        } else {
            _sellCountdown();
        }
        _updateRate(user, isBuy);
        _addUser(user);
        if (countdown <= 0 && !inDraw) _draw();
    }

    /// @notice 买入倒计时逻辑：2 分钟内递减 60→30→15→7→3→1，2 分钟后重置为 60
    /// @dev inCool：在冷却窗口内则用上次 reduce 的一半；否则从 60 秒开始
    function _buyCountdownGlobal(address user) internal {
        uint256 now_ = block.timestamp;
        uint256 reduce;

        bool inCool = (userCoolDownStartTime[user] != 0) && (now_ < userCoolDownStartTime[user] + COOL_DOWN);

        if (!inCool) {
            reduce = BASE_BUY_REDUCE;           // 60 秒
            userCoolDownStartTime[user] = now_;
            userLastBuyReduce[user] = reduce / 2;  // 下次 30
        } else {
            reduce = userLastBuyReduce[user];
            userLastBuyReduce[user] = reduce / 2;  // 递减：30→15→7→3→1
            if (userLastBuyReduce[user] == 0) userLastBuyReduce[user] = 1;  // 最低 1 秒
        }

        if (reduce > countdown) countdown = 0;
        else countdown -= reduce;
        emit Countdown(countdown);
    }

    /// @notice 卖出增加倒计时 60 秒，上限 MAX_COUNTDOWN
    function _sellCountdown() internal {
        countdown += SELL_ADD;
        if (countdown > MAX_COUNTDOWN) countdown = MAX_COUNTDOWN;
        emit Countdown(countdown);
    }

    /// @notice 更新用户爆率：卖出清零；买入 +20，上限 500
    function _updateRate(address user, bool isBuy) internal {
        if (!isBuy) {
            userRate[user] = 0;
            return;
        }
        if (userRate[user] == 0) userRate[user] = BASE_RATE;   // 50
        if (userRate[user] < MAX_RATE) userRate[user] += BUY_BOOST;  // +20
    }

    /// @notice 持仓 ≥ 5000 CDT 且本轮有买入，则加入本轮参与名单
    function _addUser(address user) internal {
        if (!hasJoined[user] && token.balanceOf(user) >= MIN_HOLD && roundHasBought[currentRound][user]) {
            hasJoined[user] = true;
            roundUsers[currentRound].push(user);
        }
    }

    /// @notice 开奖：20% 分配（60% 大奖 + 30% 小奖 + 10% 阳光奖），80% 滚存
    /// @dev 按爆率加权随机抽奖；开奖后重置 countdown、currentRound、userRate、hasJoined
    function _draw() internal {
        inDraw = true;
        uint256 rid = currentRound;
        uint256 total = prizePoolBNB;
        uint256 distribute = (total * 20) / 100;  // 20% 分配
        uint256 roll = total - distribute;        // 80% 滚存

        require(address(this).balance >= distribute, "Not enough BNB");

        address[] memory users = roundUsers[rid];
        uint256 len = users.length;
        DrawDetail memory det;
        det.rollOverAmount = roll;

        if (len > 0 && distribute > 0) {
            uint256 bigAmt = (distribute * 12) / 20;  // 大奖 60%
            address big = _drawByRate(users, new address[](0));
            det.bigWinner = big;
            det.bigPrize = bigAmt;
            det.bigWinnerRate = userRate[big];
            (bool ok1,) = payable(big).call{value: bigAmt, gas: 30000}("");
            require(ok1, "big fail");

            address[] memory nonBig;
            for (uint i=0; i<len; i++) {
                if (users[i] != big) nonBig = _push(nonBig, users[i]);
            }
            uint256 nLen = nonBig.length;

            uint256 smAmt = (distribute * 6) / 20;   // 小奖 30%
            uint256 smCnt = nLen / 2;
            if (smCnt < 1 && nLen > 0) smCnt = 1;

            address[] memory smWins;
            uint256[] memory smRates = new uint256[](smCnt);
            address[] memory exclude = new address[](1);
            exclude[0] = big;

            for (uint i=0; i<smCnt && nLen>0; i++) {
                address w = _drawByRate(nonBig, exclude);
                smWins = _push(smWins, w);
                smRates[i] = userRate[w];
                exclude = _push(exclude, w);
            }

            det.smallWinners = smWins;
            det.smallWinnerRates = smRates;
            uint256 smPer = smCnt > 0 ? smAmt / smCnt : 0;
            det.smallPrizePerPerson = smPer;
            for (uint i=0; i<smWins.length; i++) {
                (bool ok2,) = payable(smWins[i]).call{value: smPer, gas: 30000}("");
                require(ok2, "sm fail");
            }

            uint256 sunAmt = (distribute * 2) / 20;  // 阳光奖 10%
            address[] memory sunWins;
            for (uint i=0; i<nLen; i++) {
                address u = nonBig[i];
                if (!_inList(u, exclude)) sunWins = _push(sunWins, u);
            }

            uint256[] memory sunRates = new uint256[](sunWins.length);
            for (uint i=0; i<sunWins.length; i++) {
                sunRates[i] = userRate[sunWins[i]];
            }

            det.sunshineWinners = sunWins;
            det.sunshineWinnerRates = sunRates;
            uint256 sunPer = sunWins.length > 0 ? sunAmt / sunWins.length : 0;
            det.sunshinePerPerson = sunPer;
            for (uint i=0; i<sunWins.length; i++) {
                (bool ok3,) = payable(sunWins[i]).call{value: sunPer, gas: 30000}("");
                require(ok3, "sun fail");
            }
        }

        det.isFinished = true;
        roundDrawDetail[rid] = det;
        prizePoolBNB = roll;
        currentRound++;
        countdown = INIT_COUNTDOWN;

        for (uint i=0; i<users.length; i++) {
            address u = users[i];
            userRate[u] = BASE_RATE;
            hasJoined[u] = false;
        }

        emit Round(currentRound);
        emit DrawFinished(rid, det.bigWinner);
        inDraw = false;
    }

    /// @notice 按爆率加权随机抽取一个地址（排除 exclude 中的地址）
    function _drawByRate(address[] memory list, address[] memory exclude) internal view returns (address) {
        uint256 totalRate;
        for (uint i=0; i<list.length; i++) {
            address u = list[i];
            if (!_inList(u, exclude)) totalRate += userRate[u];
        }
        if (totalRate == 0) return list[0];

        uint256 rand = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, list, exclude))) % totalRate;
        uint256 acc;

        for (uint i=0; i<list.length; i++) {
            address u = list[i];
            if (_inList(u, exclude)) continue;
            acc += userRate[u];
            if (acc > rand) return u;
        }
        return list[0];
    }

    /// @notice 判断地址是否在数组中
    function _inList(address a, address[] memory arr) internal pure returns (bool) {
        for (uint i=0; i<arr.length; i++) if (arr[i] == a) return true;
        return false;
    }

    /// @notice 动态数组追加元素（Solidity 无 push 的 memory 数组）
    function _push(address[] memory a, address e) internal pure returns (address[] memory) {
        address[] memory n = new address[](a.length+1);
        for (uint i=0; i<a.length; i++) n[i] = a[i];
        n[a.length] = e;
        return n;
    }

    /// @notice 管理员手动触发开奖（倒计时已归零时）
    function manualDraw() external onlyOwner {
        require(!inDraw && countdown <= 0);
        _draw();
    }

    /// @notice 返回本轮买单人数
    function getParticipantCount() external view returns (uint256) {
        return roundBuyerCount[currentRound];
    }

    /// @notice 接收 BNB 直接进奖池（无买卖逻辑）
    receive() external payable {
        if (msg.value > 0) {
            prizePoolBNB += msg.value;
            emit PrizePool(prizePoolBNB);
        }
    }
}
