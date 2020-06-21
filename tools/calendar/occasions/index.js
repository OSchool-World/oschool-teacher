const JalaliOccasions = require('./jalali-occasions');
const HijriOccasions = require('./hijri-occasions');
const GregorianOccasions = require('./gregorian-occasions');

module.exports = {
    jalali: JalaliOccasions,
    hijri: HijriOccasions,
    gregorian: GregorianOccasions
}