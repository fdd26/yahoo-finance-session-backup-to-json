;!(function importYahooFinanceData(json)
{
	// Parse JSON if it is a string
	var data = json || {};
	if (typeof json === "string")
	{
		data = JSON.parse(json) || {};
	}

	if (!data) { return; }

	// Restore LocalStorage
	if (data.localStorage && window.localStorage && window.localStorage.setItem)
	{
		for (var lkey in data.localStorage)
		{
			if (data.localStorage.hasOwnProperty(lkey))
			{
				window.localStorage.setItem(lkey, data.localStorage[lkey]);
			}
		}
	}

	// Restore SessionStorage
	if (data.sessionStorage && window.sessionStorage && window.sessionStorage.setItem)
	{
		for (var skey in data.sessionStorage)
		{
			if (data.sessionStorage.hasOwnProperty(skey))
			{
				window.sessionStorage.setItem(skey, data.sessionStorage[skey]);
			}
		}
	}

	// Restore Readable cookies (non http-only)
	if (data.cookies)
	{
		var cookies = data.cookies.split("; ");
		var len     = +cookies.length || 0;
		for (var i = 0; i < len; ++i)
		{
			document.cookie = cookies[i] + "; path=/";
		}
	}

	// Restore IndexedDB
	if (data.indexedDB && window.indexedDB && window.indexedDB.open)
	{
		for (var dbName in data.indexedDB)
		{
			if (!data.indexedDB.hasOwnProperty(dbName)) { continue; }

			(function(dbName)
			{
				var dbReq = window.indexedDB.open(dbName);
				dbReq.onupgradeneeded = function(event)
				{
					var db     = event.target.result;
					var stores = data.indexedDB[dbName];
					for (var storeName in stores)
					{
						if (!stores.hasOwnProperty(storeName)) { continue; }
						if (!db.objectStoreNames.contains(storeName))
						{
							db.createObjectStore(storeName, { autoIncrement: true });
						}
					}
				};

				dbReq.onsuccess = function(event)
				{
					var db = event.target.result;
					var tx = db.transaction(db.objectStoreNames, "readwrite");

					for (var storeName in data.indexedDB[dbName])
					{
						if (!data.indexedDB[dbName].hasOwnProperty(storeName)) { continue; }
						var store   = tx.objectStore(storeName);
						var records = data.indexedDB[dbName][storeName];
						var recLen  = +records.length || 0;
						for (var i = 0; i < recLen; ++i)
						{
							store.add(records[i]);
						}
					}

					tx.oncomplete = function()
					{
						console.log("IndexedDB restored for " + dbName);
					};
				};

				dbReq.onerror = function()
				{
					console.warn("Failed to open IndexedDB: " + dbName);
				};
			})(dbName);
		}
	}

	console.log("Data restore attempted. Reload page to apply changes.");
})();
