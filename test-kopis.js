const { XMLParser } = require('fast-xml-parser');

async function test() {
  const SERVICE_KEY = "ade2e6f2d55b4bd389d7b284c946934c";
  const id = "PF290853";
  const res = await fetch(`http://kopis.or.kr/openApi/restful/pblprfr/${id}?service=${SERVICE_KEY}`);
  const xmlData = await res.text();
  const parser = new XMLParser();
  const jsonObj = parser.parse(xmlData);
  const item = jsonObj.dbs?.db;
  console.log("Performance Detail:", item);
  
  if (item && item.mt10id) {
    const facilityRes = await fetch(`http://kopis.or.kr/openApi/restful/prfplc/${item.mt10id}?service=${SERVICE_KEY}`);
    const facilityXml = await facilityRes.text();
    const facilityObj = parser.parse(facilityXml);
    console.log("Facility Detail:", facilityObj.dbs?.db);
  }
}
test();
