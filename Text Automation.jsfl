var doc = fl.getDocumentDOM();

if (!doc) {
	fl.trace("문서를 먼저 열어주세요.");
}


var texts = "sit_down_stand_up_come_here_open_close_door_please_okay_thank".split("_");
 
var timeline = doc.getTimeline();
var symbolPath = timeline.libraryItem.name;

var originLayer = timeline.layers[timeline.currentLayer];

timeline.duplicateLayers(timeline.currentLayer);

var selectedLayerIndex = timeline.getSelectedLayers()[0];
var layer = timeline.layers[selectedLayerIndex];

// 키프레임으로 변경
timeline.convertToKeyframes(0, layer.frames.length);

// 가이드 -> 일반 레이어로 변경
layer.layerType = "normal";
var layerName = originLayer.name;

for (var i = 0; i < layer.frames.length; i++) {
	doc.selectNone();

	// 심볼 편집 화면으로 이동
	doc.library.editItem(symbolPath);

	timeline.setSelectedLayers(selectedLayerIndex);
	timeline.setSelectedFrames(i, i);

	layer.frames[i].elements[0].setTextString(texts[i]);

	doc.selection = new Array(layer.frames[i].elements[0]);

	doc.convertSelectionToBitmap();

	// i는 프레임 인덱스
	var newBitmapName = layerName + "_" + i;

	doc.selection[0].libraryItem.name = newBitmapName;
}

doc.library.editItem(symbolPath);
