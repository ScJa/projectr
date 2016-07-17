/**
 * Created by stefan on 10.06.16.
 */

// dont have to be so mad

function strContains(str, substr) {
    return str.indexOf(substr) > -1;
}

function isDefined(obj) {
    return typeof obj !== 'undefined' && obj;
}

module.exports = {
    strContains,
    isDefined
};
