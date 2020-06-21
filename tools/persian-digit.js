module.exports = 
    function (val) {
        return String(val).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
    }