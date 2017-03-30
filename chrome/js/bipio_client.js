/**
 *
 * Copyright (c) 2017 InterDigital, Inc. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */
var BIPClient = {
    //endPoint : 'http://dev-local.bip.io:5000',
    //siteEndPoint : 'http://dev-local.bip.io',
    endPoint : 'https://api.bip.io',
    siteEndPoint : 'https://bip.io',
    token : undefined,
    tokenBind: function( token ) {
        var self = this;
        $.ajaxSetup({
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Basic ' + token);
                return xhr;
            }
        });
        self.token = token;
    },

    tokenIsBound: function() {
        return undefined != this.token;
    },

    getAuth: function(cb) {
        var self = this;
        $.ajax({
            type : 'GET',
            url : self.siteEndPoint + '/auth/who',
            dataType : 'json',
            contentType : 'application/json',
            success : function(data) {
                self.tokenBind(data.api_token_web);
                if (cb) {
                    cb(false);
                }
            },
            error: function(xhr, status, errText) {
                if (xhr.status == 403 && undefined != cb) {
                    cb(true);
                }
            }
        });
    },

    //  request handler
    _request : function(payload, methodAPI, methodHTTP, cb) {
        var self = this;
        var payload = payload;
        var reqStruct = {
            type: methodHTTP,
            url: self.endPoint + methodAPI,
            success: function(resData, status, xhr) {
                if (undefined != cb) {
                    cb(false, resData);
                }
            },
            error: function(xhr, status, errText) {
                    // conflict? then get the matching record
                    if (xhr.status == 409) {
                        var responseObj = $.parseJSON(xhr.responseText);
                        if (undefined != responseObj.id) {
                            cb(false, responseObj);
                        } else {
                            cb(true, errText);
                        }
                    } else if (undefined !== cb) {
                        cb(true, errText);
                    }
                }
            };

        if (null != payload) {
            reqStruct.data = JSON.stringify(payload);
            reqStruct.dataType = 'json';
            reqStruct.contentType = 'application/json';
        }

        $.ajax(reqStruct);
    },

    req: function(url, method, payload, cb) {
        this._request(
            payload,
            url,
            method,
            cb
            );
    },

    // context menu actions
    createFromDomain : function(tab, cb) {
        this.req('/rpc/bip/create_from_referer?referer=' + tab.url, 'GET', null, cb);
    },

    createFromInput : function(value, tab, cb) {
        this.req('/rest/bip?referer=' + tab.url, 'POST', {
            name : value
        }, cb);
    }
}

$(document).ready(function() {
    BIPClient.getAuth();
});


