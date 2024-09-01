function exportExcel() {
    /*
    $('.sortable').table2excel({
        exclude: ".no-export",
        filename: "download.xls",
        fileext: ".xls",
        exclude_links: false,
        exclude_inputs: true
    });
    */


    //console.log(pubarr);
    //console.log(originalPublications);
    const pubarr = originalPublications.map((obj) => { return Object.keys(obj).map((key) => { return obj[key]; }); });
    var wb = XLSX.utils.book_new();
    wb.Props
    {
        Title: "Vidvaan Report";
        Subject: "Report";
        Author: "Team Vidvaan";

    }
    wb.SheetNames.push("Report Sheet");
    pubarr.unshift(["Name     ", "Year    ", "Authors        ", "Link             ", "Academic Database"])
    wb.Sheets["Report Sheet"] = XLSX.utils.aoa_to_sheet(pubarr);
    var wbout = XLSX.write(wb, { booktype: 'xlsx', type: 'binary' });
    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), 'Vidvaan Report.xlsx');

}
function convertToArray(tup) {
    var Arr = Object.keys(tup).map(
        (key) => tup[key]);
    return Arr;
}

function s2ab(s) {
    var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    var view = new Uint8Array(buf);  //create uint8array as viewer
    for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
    return buf;
}