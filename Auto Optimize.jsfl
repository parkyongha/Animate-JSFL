var doc = fl.getDocumentDOM();
if (!doc) {
	fl.trace("문서를 먼저 열어주세요.");
}

if (gotoMainTimeline()) {
	var shapeLayers = [];
	var longFrameLayers = [];

	// 타임 라인 받아오기
	var mainTimeline = doc.getTimeline();

	// 메인 타임라인에는 symbolPath "Main"을 사용 (필요에 따라 변경)
	traverseTimeline(mainTimeline, "Main");

	// 최적화되지 않은 심볼 정보들을 출력
	PrintWrongLayers();
}


function traverseTimeline(timeline, symbolPath) {
	// 각 레이어 순회
	for (var l = 0; l < timeline.layers.length; l++) {
		var layer = timeline.layers[l];
		var layerName = layer.name;

		// 각 레이어마다 한 번만 재귀로 들어갈 심볼 인스턴스를 처리하기 위한 플래그
		var recursedForLayer = false;

		// 가이드인 경우 스킵
		if (layer.layerType == "guide") {
			continue;
		}

		// 프레임 길이가 60이 넘으면 긴 프레임으로 간주
		if (layer.frames.length > 60) {

			optimizeLongTweenFrames(layer.frames, timeline, l, symbolPath);

			longFrameLayers.push({
				symbolPath: symbolPath,
				layerName: layerName,
				frameCount: layer.frames.length,
				KeyFrameCount: getKeyframeCount(layer.frames)
			});
		}

		// 각 프레임 순회
		for (var f = 0; f < layer.frames.length; f++) {

			var elementsToConvert = [];

			var frame = layer.frames[f];

			// 키프레임이 아니면 넘김
			if (f !== 0 && frame.startFrame != f) {
				continue
			}

			// 프레임에 포함된 요소(element) 중 심볼 인스턴스가 있다면 재귀 처리
			// 단, 한 레이어 내에서 단 한 번만 재귀하도록 함.
			if (!recursedForLayer && frame.elements && frame.elements.length > 0) {
				for (var e = 0; e < frame.elements.length; e++) {
					var element = frame.elements[e];

					if (element.elementType == "shape" || element.elementType == "text") {

						// 벡터 이미지거나 텍스트인 경우
						// 라이브러리에서의 심볼 경로, 레이어, frame, 요소 타입 을 출력
						shapeLayers.push({
							symbolPath: symbolPath,
							layerName: layerName,
							frame: f + 1,
							shapeType: element.elementType
						});

						element.symbolPath = symbolPath;
						elementsToConvert.push(element);
					}

					// 프레임 요소가 MovieClip이나 Graphic인 경우에만 탐색
					if (element.libraryItem) {
						if (element.libraryItem.itemType == "movie clip" ||
							element.libraryItem.itemType == "graphic") {

							traverseTimeline(element.libraryItem.timeline, element.libraryItem.name);

							// 해당 레이어에서 한 번만 재귀 처리                       
							recursedForLayer = true;

							break;
						}
					}
				}
			}

			// 벡터 이미지, 텍스트를 Bitmap으로 변환
			for (var i = 0; i < elementsToConvert.length; i++) {
				doc.selectNone();

				// 심볼 편집 화면으로 이동
				doc.library.editItem(elementsToConvert[i].symbolPath);

				// 수정할 레이어와 프레임을 선택
				timeline.setSelectedLayers(l);
				timeline.setSelectedFrames(f, f);

				// 수정이 필요한 프레임의 요소를 선택으로 변경
				doc.selection = new Array(elementsToConvert[i]);

				// 선택되어 있는 객체를 비트맵화
				doc.convertSelectionToBitmap();

				// f는 프레임 인덱스
				var newBitmapName = layerName + "_" + f;

				var sel = doc.selection;

				if (sel && sel.length > 0 && sel[0].libraryItem) {
					sel[0].libraryItem.name = newBitmapName;
					fl.trace("새 비트맵 이름: " + newBitmapName);
				} else {
					fl.trace("비트맵 이름 변경에 실패했습니다.");
				}
			}
		}
	}
}

// 벡터 이미지거나 텍스트인 레이어의 정보를 출력
// 프레임이 긴 레이어의 정보를 출력
function PrintWrongLayers() {
	fl.trace("Shape or Text Layers =========================================== ");

	shapeLayers.forEach(function (layer) {
		fl.trace("symbolPath : " + layer.symbolPath + " ====================" + "\nlayerName : " + layer.layerName + "\nframe : " + layer.frame + "\nType : " + layer.shapeType + "\n");
	});

	fl.trace("Long Frame Layers ============================================== ");

	longFrameLayers.forEach(function (layer) {
		fl.trace("symbolPath : " + layer.symbolPath + " ====================" + "\nlayerName : " + layer.layerName + "\nframeCount : " + layer.frameCount + "\nKeyFrameCount : " + layer.KeyFrameCount + "\n");
	});
}

// Key Frame이 몇개인지 받아오는 함수
function getKeyframeCount(frames) {
	if (!frames || frames.length === 0) {
		return 0;
	}

	var count = 0;

	for (var i = 0; i < frames.length; i++) {
		// 첫 번째 프레임은 항상 키프레임으로 취급
		if (i === 0 || frames[i].startFrame === i) {
			count++;
		}
	}

	return count;
}

// 프레임 전체가 Tween인 경우 Key Frame으로 변경 후 Tween 제거
function optimizeLongTweenFrames(frames, timeline, l, symbolPath) {

	var frameCount = frames.length;

	// 프레임 전체가 Tween이 아닌 경우 return
	for (var i = 0; i < frameCount - 1; i++) {
		if (frames[i].tweenType !== "motion") {
			return;
		}
	}

	// 심볼 편집
	doc.library.editItem(symbolPath);

	// 수정할 레이어 선택
	timeline.setSelectedLayers(l);

	// 프레임 전체를 키프레임으로 변경
	timeline.convertToKeyframes(0, frameCount - 1);

	// 프레임 정보를 다시 받은 후 수정
	timeline.layers[l].frames.forEach(function (frame) {
		frame.tweenType = "none";
	});
}

function gotoMainTimeline() {
	var libraryItems = doc.library.items;
	var movieClipFound = false;

	// 라이브러리 항목 순회
	for (var i = 0; i < libraryItems.length; i++) {
		var item = libraryItems[i];
		if (item.itemType === "movie clip") {
			movieClipFound = true;
			var clipName = item.name;

			doc.library.editItem(clipName);

			break;
		}
	}

	if (!movieClipFound) {
		return false;
	}


	doc.exitEditMode();

	return true;
}