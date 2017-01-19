/*
* Licensed to the Apache Software Foundation (ASF) under one or more
* contributor license agreements.  See the NOTICE file distributed with
* this work for additional information regarding copyright ownership.
* The ASF licenses this file to You under the Apache License, Version 2.0
* (the "License"); you may not use this file except in compliance with
* the License.  You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

var QUANTITY_SUFFIX = ["", "K", "M", "B", "T", "e15", "e18", "e21"]
var SIZE_SUFFIX = ["", "K", "M", "G", "T", "P", "E", "Z"]

function toggle(selection) {
  var p = document.getElementById(selection);
  var style = p.className;
  p.className = style == "hide" ? "show" : "hide";
}

function bigNumberForSize(size) {
    if (size === null) 
        size = 0;
    return bigNumber(size, SIZE_SUFFIX, 1024);
}

function bigNumberForQuantity(quantity) {
    if (quantity === null)
        quantity = 0;
    return bigNumber(quantity, QUANTITY_SUFFIX, 1000);
}

function bigNumber(big, suffixes, base) {
    if (big < base) {
        return big + suffixes[0];
    }
    var exp = Math.floor(Math.log(big) / Math.log(base));
    var val = big / Math.pow(base, exp);
    return val.toFixed(2) + suffixes[exp];
}

function timeDuration(time) {
    var ms, sec, min, hr, day, yr;
    ms = sec = min = hr = day = yr = -1;
    
    time = Math.floor(time);
    if (time == 0) {
        return "&mdash;";
    }
    
    ms = time % 1000;
    time = Math.floor(time / 1000);
    if (time == 0) {
        return ms + "ms";
    }
    
    sec = time % 60;
    time = Math.floor(time / 60);
    if (time == 0) {
        return sec + "s" + "&nbsp;" + ms + "ms";
    }
    
    min = time % 60;
    time = Math.floor(time / 60);
    if (time == 0) {
        return min + "m" + "&nbsp;" + sec + "s";
    }
    
    hr = time % 24;
    time = Math.floor(time / 24);
    if (time == 0) {
        return hr + "h" + "&nbsp;" + min + "m";
    }
    
    day = time % 365;
    time = Math.floor(time / 365);
    if (time == 0) {
        return day + "d" + "&nbsp;" + hr + "h";
    }
    
    yr = Math.floor(time);
    return yr + "y" + "&nbsp;" + day + "d";
}












