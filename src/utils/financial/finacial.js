var DayCountBasis = require("./lib/daycountbasis.js");
var Bonds         = require("./lib/bonds.js");
var Depreciation  = require("./lib/depreciation.js");
var Irr           = require("./lib/irr.js");
var Loan          = require("./lib/loan.js");
var Misc          = require("./lib/misc.js");
var TBill         = require("./lib/tbill.js");
var Tvm           = require("./lib/tvm.js");
var OddBonds      = require("./lib/oddbonds.js");

var ACCRINTM = function(issue, settlement, rate, par, basis) {
    return Bonds.ACCRINTM(issue, settlement, rate, par, basis);
};

var AMORLINC = function(cost, datePurchased, firstPeriod, salvage, period, rate, basis) {
    return Depreciation.AMORLINC(cost, datePurchased, firstPeriod, salvage, period, rate, basis);
};

var COUPDAYS = function(settlement, maturity, frequency, basis) {
    return DayCountBasis.COUPDAYS(settlement, maturity, frequency, basis);
};

var COUPDAYSNC = function(settlement, maturity, frequency, basis) {
    return DayCountBasis.COUPDAYSNC(settlement, maturity, frequency, basis);
};

var COUPNCD = function(settlement, maturity, frequency, basis) {
    return DayCountBasis.COUPNCD(settlement, maturity, frequency, basis);
};

var COUPNUM = function(settlement, maturity, frequency, basis) {
    return DayCountBasis.COUPNUM(settlement, maturity, frequency, basis);
};

var COUPPCD = function(settlement, maturity, frequency, basis) {
    return DayCountBasis.COUPPCD(settlement, maturity, frequency, basis);
}

var DISC = function(settlement, maturity, pr, redemption, basis) {
    return Bonds.DISC(settlement, maturity, pr, redemption, basis);
}

var DURATION = function(settlement, maturity, coupon, yld, frequency, basis) {
    return Bonds.DURATION(settlement, maturity, coupon, yld, frequency, basis);
}

var INTRATE = function(settlement, maturity, investment, redemption, basis) {
    return Bonds.INTRATE(settlement, maturity, investment, redemption, basis);
}

var MDURATION = function(settlement, maturity, coupon, yld, frequency, basis) {
    return Bonds.MDURATION(settlement, maturity, coupon, yld, frequency, basis);
}

var ODDFPRICE = function(settlement, maturity, issue, firstCoupon, rate, yld, redemption, frequency, basis) {
    return OddBonds.ODDFPRICE(settlement, maturity, issue, firstCoupon, rate, yld, redemption, frequency, basis);
}

var ODDFYIELD = function(settlement, maturity, issue, firstCoupon, rate, pr, redemption, frequency, basis) {
    return OddBonds.ODDFYIELD(settlement, maturity, issue, firstCoupon, rate, pr, redemption, frequency, basis);
}

var PRICE = function(settlement, maturity, rate, yld, redemption, frequency, basis) {
    return Bonds.PRICE(settlement, maturity, rate, yld, redemption, frequency, basis);
}

var XNPV = function(r, cfs, dates) {
    return Irr.XNPV(r, cfs, dates);
}

var YIELDDISC = function(settlement, maturity, pr, redemption, basis) {
    return Bonds.YIELDDISC(settlement, maturity, pr, redemption, basis);
}

var YIELDMAT = function(settlement, maturity, issue, rate, pr, basis) {
    return Bonds.YIELDMAT(settlement, maturity, issue, rate, pr, basis);
}

var PRICEDISC = function(settlement, maturity, discount, redemption, basis) {
    return Bonds.PRICEDISC(settlement, maturity, discount, redemption, basis);
}

var PRICEMAT = function(settlement, maturity, issue, rate, yld, basis) {
    return Bonds.PRICEMAT(settlement, maturity, issue, rate, yld, basis);
};

var RECEIVED = function(settlement, maturity, investment, discount, basis) {
    return Bonds.RECEIVED(settlement, maturity, investment, discount, basis);
};

var TBILLEQ = function(settlement, maturity, discount) {
    return TBill.TBILLEQ(settlement, maturity, discount);
};

var TBILLPRICE = function(settlement, maturity, discount) {
    return TBill.TBILLPRICE(settlement, maturity, discount);
};

var TBILLYIELD = function(settlement, maturity, pr) {
    return TBill.TBILLYIELD(settlement, maturity, pr);
};

var VDB = function(cost, salvage, life, startPeriod, endPeriod, factor, bflag) {
    return Depreciation.VDB(cost, salvage, life, startPeriod, endPeriod, factor, bflag);
};

var XIRR = function(cfs, dates, guess) {
    return Irr.XIRR(cfs, dates, guess);
};

var AMORDEGRC = function(cost, datePurchased, firstPeriod, salvage, period, rate, basis, excelComplaint) {
    return Depreciation.AMORDEGRC(cost, datePurchased, firstPeriod, salvage, period, rate, basis, excelComplaint);
};

var COUPDAYBS = function(settlement, maturity, frequency, basis) {
    return DayCountBasis.COUPDAYSBS(settlement, maturity, frequency, basis);
};

var ODDLPRICE = function(settlement, maturity, lastInterest, rate, yld, redemption, frequency, basis) {
    return OddBonds.ODDLPRICE(settlement, maturity, lastInterest, rate, yld, redemption, frequency, basis);
};

var ODDLYIELD = function(settlement, maturity, lastInterest, rate, pr, redemption, frequency, basis) {
    return OddBonds.ODDLYIELD(settlement, maturity, lastInterest, rate, pr, redemption, frequency, basis);
};

export {
    ACCRINTM,
    AMORLINC,
    COUPDAYS,
    COUPDAYSNC,
    COUPNCD,
    COUPNUM,
    COUPPCD,
    DISC,
    DURATION,
    INTRATE,
    MDURATION,
    ODDFPRICE,
    ODDFYIELD,
    XNPV,
    YIELDDISC,
    YIELDMAT,
    PRICE,
    PRICEDISC,
    PRICEMAT,
    RECEIVED,
    TBILLEQ,
    TBILLPRICE,
    TBILLYIELD,
    VDB,
    XIRR,
    AMORDEGRC,
    COUPDAYBS,
    ODDLPRICE,
    ODDLYIELD
  }
