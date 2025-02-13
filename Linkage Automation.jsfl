var doc = fl.getDocumentDOM();

if (!doc) {
	fl.trace("문서를 먼저 열어주세요.");
}

var library = doc.library;

var selectedItems = library.getSelectedItems();

selectedItems.forEach(function (item) {
	if (item.itemType == "folder") {

		library.selectItem(item.name);

		var folderName = item.name.split("/").slice(-1);
		fl.trace("폴더명 : " + folderName);

		findFolerItems(folderName, item.name);
	}
});

function findFolerItems(folderName, folderPath) {

	var libraryItems = library.items;

	var itemIndex = 0;
	
	for (var i = 0; i < libraryItems.length; i++) {
		var item = libraryItems[i];
		
		if (item.name && item.name.indexOf(folderPath) === 0 && item.itemType != "folder") {
			fl.trace("아이템 이름: " + item.name);
			fl.trace("아이템 Linkage: " + item.linkageClassName);

			item.linkageClassName = folderName + "_" + itemIndex++;
		}
	}
}