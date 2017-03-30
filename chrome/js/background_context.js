/**
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
$(document).ready(function() {

    var modes = chrome.contextMenus.create({
                    "title": 'Create Email',
                    "contexts":["editable"]
                });

    var notify = {
        'go' : function(error, message) {
            notification = webkitNotifications.createNotification(
                '/img/icon.png',
                error ? 'Failed' : 'Success',
                message
            );            
            notification.show();
            setTimeout(function(){
                notification.cancel();
              }, 5000);
        }
    };

    function checkAuth(cb) {
        if (!BIPClient.tokenIsBound()) {
            BIPClient.getAuth(function(err) {
                if (err) {
                    notify.go(true, 'Please log in to bip.io');
                    chrome.tabs.create({ url : BIPClient.siteEndPoint });    
                } else {
                    cb();
                }
            });            
        } else {
            cb();
        }        
    };

    var modeInfo = {
        'domain' : {
            'title' : 'From Domain',
            'menuId' : null,
            'onClick' : function(item, tab) {
                checkAuth(
                    function() {
                        BIPClient.createFromDomain(tab, function(isError, response) {
                            if (!isError) {
                                debugger;
                                chrome.tabs.sendMessage(tab.id, {
                                    type : 'setValue',
                                    data : response._repr
                                    });
                                notify.go(false, response._repr + ' created');
                            } else {
                                notify.go(true, 'Could not create bip, please try again');
                            }
                        });
                    }
                );                
            }
        },
        'input' : {
            'title' : 'From This Input',
            'menuId' : null,
            'onClick' : function(item, tab) {
                checkAuth(
                    function() {
                        chrome.tabs.sendMessage(tab.id, { type : 'getValue' }, function(inputValue) {
                            if (inputValue != '') {                       
                                BIPClient.createFromInput(inputValue, tab, function(isError, response) {
                                    if (!isError) {
                                        chrome.tabs.sendMessage(tab.id, { type : 'setValue', data : response._repr});
                                        notify.go(false, 'bip ' + response._repr + ' created');
                                    } else {
                                        notify.go(true, 'Could not create [' + inputValue + '] bip, please try again');
                                    }
                                });
                            }
                        });
                    }
                );
            }
        }
    };

    var menuPtr = {};

    var contextArgs = {};
    var struct = null;

    for (var i in modeInfo) {
        struct = modeInfo[i];

        contextArgs = {
            'parentId' : modes,
            'onclick' : struct.onClick,
            'contexts' : ['editable'],
            'title' : struct.title
        };

        if (struct.title == '-') {
            contextArgs['type'] = 'separator';
    //    } else {
    //        contextArgs['type'] = 'radio'

        }

        modeInfo[i].menuId = chrome.contextMenus.create(contextArgs);
        // add reverse ptr
        menuPtr[modeInfo[i].menuId] = i
    }
});
