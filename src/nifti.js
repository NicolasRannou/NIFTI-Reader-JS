
/*jslint browser: true, node: true */
/*global require, module */

"use strict";

/*** Imports ***/

var nifti = nifti || {};
nifti.NIFTI1 = nifti.NIFTI1 || ((typeof require !== 'undefined') ? require('./nifti1.js') : null);
nifti.NIFTI2 = nifti.NIFTI2 || ((typeof require !== 'undefined') ? require('./nifti2.js') : null);
nifti.Utils = nifti.Utils || ((typeof require !== 'undefined') ? require('./utilities.js') : null);

var pako = pako || ((typeof require !== 'undefined') ? require('pako') : null);



/*** Static Methods ***/

nifti.isNIFTI1 = function (data) {
    var buf, mag1, mag2, mag3;

    buf = new DataView(data);
    mag1 = buf.getUint8(nifti.NIFTI1.MAGIC_NUMBER_LOCATION);
    mag2 = buf.getUint8(nifti.NIFTI1.MAGIC_NUMBER_LOCATION + 1);
    mag3 = buf.getUint8(nifti.NIFTI1.MAGIC_NUMBER_LOCATION + 2);

    return !!((mag1 === nifti.NIFTI1.MAGIC_NUMBER[0]) && (mag2 === nifti.NIFTI1.MAGIC_NUMBER[1]) &&
        (mag3 === nifti.NIFTI1.MAGIC_NUMBER[2]));
};



nifti.isNIFTI2 = function (data) {
    var buf, mag1, mag2, mag3;

    buf = new DataView(data);
    mag1 = buf.getUint8(nifti.NIFTI2.MAGIC_NUMBER_LOCATION);
    mag2 = buf.getUint8(nifti.NIFTI2.MAGIC_NUMBER_LOCATION + 1);
    mag3 = buf.getUint8(nifti.NIFTI2.MAGIC_NUMBER_LOCATION + 2);

    return !!((mag1 === nifti.NIFTI2.MAGIC_NUMBER[0]) && (mag2 === nifti.NIFTI2.MAGIC_NUMBER[1]) &&
    (mag3 === nifti.NIFTI2.MAGIC_NUMBER[2]));
};



nifti.isNIFTI = function (data) {
    return (nifti.isNIFTI1(data) || nifti.isNIFTI2(data));
};



nifti.isCompressed = function (data) {
    var buf, magicCookie1, magicCookie2;

    if (data) {
        buf = new DataView(data);

        magicCookie1 = buf.getUint8(0);
        magicCookie2 = buf.getUint8(1);

        if (magicCookie1 === nifti.Utils.GUNZIP_MAGIC_COOKIE1) {
            return true;
        }

        if (magicCookie2 === nifti.Utils.GUNZIP_MAGIC_COOKIE2) {
            return true;
        }
    }

    return false;
};



nifti.decompress = function (data) {
    return pako.inflate(data).buffer;
};



nifti.readHeader = function (data) {
    var header = null;

    if (nifti.isNIFTI1(data)) {
        header = new nifti.NIFTI1();
    } else if (nifti.isNIFTI2(data)) {
        header = new nifti.NIFTI2();
    }

    if (header) {
        header.readHeader(data);
    }

    return header;
};



nifti.hasExtension = function (header) {
    return (header.extensionFlag[0] != 0);
};



nifti.readImage = function (header, data) {
    var imageOffset = header.vox_offset;
    var imageSize = header.dims[1] * header.dims[2] * header.dims[3] * header.dims[4] * (header.numBitsPerVoxel / 8);
    return data.slice(imageOffset, imageOffset + imageSize);
};



nifti.readExtension = function (header, data) {
    var loc = header.getExtensionLocation(),
        size = header.extensionSize;

    return data.slice(loc, loc + size);
};



nifti.readExtensionData = function (header, data) {
    var loc = header.getExtensionLocation(),
        size = header.extensionSize;

    return data.slice(loc + 8, loc + size - 8);
};


/*** Exports ***/

var moduleType = typeof module;
if ((moduleType !== 'undefined') && module.exports) {
    module.exports = nifti;
}
