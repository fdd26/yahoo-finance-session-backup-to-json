(async function importYahooFinanceData(json) {
    const data = typeof json === "string" ? JSON.parse(json) : json;

    // Restore LocalStorage
    if(data.localStorage){
        for(const key in data.localStorage){
            localStorage.setItem(key, data.localStorage[key]);
        }
    }

    // Restore IndexedDB
    if(data.indexedDB){
        for(const dbName in data.indexedDB){
            const dbReq = indexedDB.open(dbName);
            dbReq.onupgradeneeded = function(event){
                const db = event.target.result;
                const stores = data.indexedDB[dbName];
                for(const storeName in stores){
                    if(!db.objectStoreNames.contains(storeName)){
                        db.createObjectStore(storeName, {autoIncrement:true});
                    }
                }
            };
            dbReq.onsuccess = function(event){
                const db = event.target.result;
                const tx = db.transaction(db.objectStoreNames, 'readwrite');
                for(const storeName in data.indexedDB[dbName]){
                    const store = tx.objectStore(storeName);
                    for(const record of data.indexedDB[dbName][storeName]){
                        store.add(record);
                    }
                }
                tx.oncomplete = function(){ console.log(`IndexedDB restored: ${dbName}`);}
            };
        }
    }

    // Restore cookies (non-HttpOnly)
    if(data.cookies){
        const cookies = data.cookies.split("; ");
        for(const c of cookies){
            document.cookie = c + "; path=/";
        }
    }

    console.log("Data restore attempted. Reload page to apply.");
})();
