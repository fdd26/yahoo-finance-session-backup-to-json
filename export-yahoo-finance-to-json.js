;!(function exportYahooFinanceData()
{
    var exportObj = {};

    // Export LocalStorage
    exportObj.localStorage = {};
    var lsLen = window.localStorage && +localStorage.length || 0;
    for (var i = 0; i < lsLen; ++i)
    {
        var key = localStorage.key(i);
        exportObj.localStorage[key] = localStorage.getItem(key);
    }

    // Export SessionStorage
    exportObj.sessionStorage = {};
    var ssLen = window.sessionStorage && +sessionStorage.length || 0;
    for (var i = 0; i < ssLen; ++i)
    {
        var key = sessionStorage.key(i);
        exportObj.sessionStorage[key] = sessionStorage.getItem(key);
    }

    // Export IndexedDB
    exportObj.indexedDB = {};
    if (window.indexedDB && indexedDB.databases)
    indexedDB.databases().then(function(dbs)
    {
        var dbCount = +dbs.length;
        for (var i = 0; i < dbCount; ++i)
        {
            (function(dbInfo)
             {
                var dbName = dbInfo.name;
                if (!dbName) return;

                exportObj.indexedDB[dbName] = {};
                var dbReq = indexedDB.open(dbName);
                dbReq.onsuccess = function(event)
                {
                    var db = event.target.result;
                    var tx = db.transaction(db.objectStoreNames, 'readonly');
                    var storeLen   = +db.objectStoreNames.length;
                    var storeCount = 0;
                    if (storeLen === 0) return;
                    for (var j = 0; j < storeLen; ++j)
                    {
                        (function(storeName) {
                            var store     = tx.objectStore(storeName);
                            var getAllReq = store.getAll();
                            
                            getAllReq.onsuccess = function()
                            {
                                exportObj.indexedDB[dbName][storeName] = getAllReq.result;
                                ++storeCount;
                                if (storeCount === storeLen)
                                {
                                    // all stores processed for this db
                                }
                            };
                            
                            getAllReq.onerror = function()
                            {
                                console.warn('IndexedDB store getAll failed: ' + storeName);
                            };
                        })(db.objectStoreNames[j]);
                    }
                };

                dbReq.onerror = function()
                {
                    console.warn('IndexedDB open failed: ' + dbName);
                };
            })(dbs[i]);
        }

        // Export Readable cookies (non http-only)
        exportObj.cookies = document.cookie;

        function pad(n) { n = +n || 0; return (n < 10) ? ('0' + n) : n; }
        
        // Create Timestamp
        var now     = new Date();
        var year    = +now.getFullYear();
        var month   = 1+now.getMonth();
        var day     = +now.getDate();
        var hours   = +now.getHours();
        var minutes = +now.getMinutes();        
        var pm      = (+hours >= 12) ? 'pm' : 'am';
        var timestamp = [year, '-', pad(month), '-' + pad(day),
                        '-', pad(hours), 'h', pad(minutes), pm].join('');

        // Download JSON file
        var exportStr = JSON.stringify(exportObj, null, 2);
        var blob   = new Blob([exportStr], { type: 'application/json' });
        var url    = URL.createObjectURL(blob);
        var a      = document.createElement('a');
        a.href     = url;
        a.download = 'yahoo_finance_backup.' + timestamp + '.json';
        a.click();
        URL.revokeObjectURL(url);

        console.log('Export complete! File downloaded: yahoo_finance_backup.' + timestamp + '.json');
    });
})();
