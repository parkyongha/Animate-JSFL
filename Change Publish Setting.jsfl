var doc = fl.getDocumentDOM();

if (!doc) {
	fl.trace("문서를 먼저 열어주세요.");
}

main();

function main() {
	var fileName = getFileSegment(doc.name);

	var projectPath = GetProjectPath();

	deleteOldFilesAndFolder(fileName, projectPath + "/bin/");

	changePublishSetting(fileName);

	ImportPublishTemplate(projectPath);
}

function deleteOldFilesAndFolder(fileName, filePath) {
	// 삭제할 항목의 접두어(prefix)를 지정합니다.
	// 예: "BW_XXXXXX" 일 때 "BW" 로 시작하는 파일/폴더 삭제
	var prefix = fileName.split("_")[0];

	var targetFolder = filePath;

	fl.trace("prefix : " + fileName);

	// targetFolder 내의 모든 항목(파일 및 폴더) 리스트를 가져옵니다.
	var items = FLfile.listFolder(targetFolder);

	if (items) {
		for (var i = 0; i < items.length; i++) {
			var itemName = items[i];

			fl.trace("item Names : " + itemName);
			// 항목 이름이 prefix로 시작하는지 확인합니다.
			if (itemName.indexOf(prefix) === 0 && itemName != fileName) {
				// 전체 경로를 구성합니다.
				var fullPath = targetFolder + "/" + itemName;

				// 폴더인지 파일인지 판별하기 위해
				// 해당 경로에서 폴더 목록을 가져와봅니다.
				var subItems = FLfile.listFolder(fullPath, "directories");
				if (subItems) {
					// subItems가 존재하면 폴더로 간주하고 재귀적으로 삭제합니다.
					FLfile.remove(fullPath);
					fl.trace("폴더 삭제: " + fullPath);
				} else {
					// 그렇지 않으면 파일로 간주하고 삭제합니다.
					FLfile.remove(fullPath);
					fl.trace("파일 삭제: " + fullPath);
				}
			}
		}
	} else {
		fl.trace("지정한 폴더 내에 항목이 없습니다.");
	}
}

function changePublishSetting(fileName) {
	// 현재 퍼블리시 프로필 이름 가져오기
	var profileName = doc.currentPublishProfile;
	fl.trace("현재 퍼블리시 프로필: " + profileName);

	// 퍼블리시 프로필 XML 문자열 추출
	var profileXML = doc.exportPublishProfileString(profileName);
	//fl.trace("원본 퍼블리시 프로필 XML:\n" + profileXML);

	// filename 변경: bin/BW_5775307.js -> bin/fileName.js
	var modifiedProfileXML =
		profileXML.replace(/(<Property name="filename">bin\/)[^.]+(\.js<\/Property>)/, "$1" + fileName + "$2")
	// soundsPath 변경: BW_5775307/sounds/ -> fileName/sounds/
	.replace(/(<Property name="soundsPath">)[^\/]+(\/sounds\/<\/Property>)/, "$1" + fileName + "$2")
	// imagesPath 변경: BW_5775307/images/ -> fileName/images/
	.replace(/(<Property name="imagesPath">)[^\/]+(\/images\/<\/Property>)/, "$1" + fileName + "$2")
	// libraryPath 변경: BW_5775307/libs/ -> fileName/libs/
	.replace(/(<Property name="libraryPath">)[^\/]+(\/libs\/<\/Property>)/, "$1" + fileName + "$2");

	// 수정된 XML 문자열을 다시 적용
	doc.importPublishProfileString(modifiedProfileXML);

	fl.trace("퍼블리시 설정이 업데이트되었습니다.");
}

function ImportPublishTemplate(projectPath) {

	var profileXML = doc.exportPublishProfileString(doc.currentPublishProfile);

	var xmlData = new XML(profileXML);

	for each(var property in xmlData.children().Property) {

		// fl.trace("xml property : " + property.@name);

		if (property.@name == "templateTitle") {
			var htmlPath = new String(property).replace(" (Custom)", ".html");
			
			fl.trace("htmlPath : " + htmlPath);
			
			doc.importCanvasPublishTemplate(projectPath + "/" + htmlPath);
		}
	}
}

// 현재 문서의 전체 경로에서 프로젝트 경로(예: 마지막 두 요소 제거)를 반환하는 함수
function GetProjectPath() {
	var fullPath = doc.path;
	fl.trace("전체 파일 경로: " + fullPath);

	var parts = fullPath.split("\\");

	var remainingParts = null;

	fullPath = fullPath.toLowerCase();

	if (fullPath.indexOf(".xfl") !== -1) {
		fl.trace("현재 열린 파일은 XFL 형식입니다.");
		remainingParts = parts.slice(0, parts.length - 2);

	} else if (fullPath.indexOf(".fla") !== -1) {
		fl.trace("현재 열린 파일은 FLA 형식입니다.");
		remainingParts = parts.slice(0, parts.length - 1);
	}

	// 예: 마지막 두 요소(파일명 등)를 제거
	var remainingPath = remainingParts.join("\\");
	remainingPath = convertWindowsPathToURI(remainingPath);

	fl.trace("프로젝트 경로: " + remainingPath);

	return remainingPath;
}

// Windows 경로를 파일 URL 형식으로 변환하는 함수
function convertWindowsPathToURI(winPath) {
	var uri = winPath.replace(/\\/g, "/");
	if (uri.charAt(1) === ":") {
		uri = "file:///" + uri.charAt(0) + "|" + uri.substring(2);
	} else {
		uri = "file:///" + uri;
	}
	return uri;
}

function getFileSegment(fileName) {

	var result = null;

	if (fileName.indexOf(".xfl") !== -1) {
		result = fileName.replace(/\.xfl$/i, "");

	} else if (fileName.indexOf(".fla") !== -1) {
		result = fileName.replace(/\.fla$/i, "");
	}

	// 밑줄("_")로 분리
	var parts = result.split("_");

	// 마지막 두 요소가 존재하면 추출
	if (parts.length >= 2) {
		var extracted = parts.slice(-2).join("_");
		return extracted;
	} else {
		fl.trace("추출할 수 없는 파일 이름 형식입니다.");
		return null;
	}

	return result;
}
