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
    pubarr.unshift(["Name     ", "Year    ", "Authors        ", "Link             ", "Summary   ","Academic Database"]);
    var ws = XLSX.utils.aoa_to_sheet(pubarr);
    //change width of columns
    var wscols = [{wch:50},{wch:10},{wch:60},{wch:50},{wch:20}];
    ws['!cols'] = wscols;

    //final pushout sheet
    wb.Sheets["Report Sheet"] = ws;

    //enable wrapText
    for (i in ws) {
        if (typeof(ws[i]) != "object") continue;
        let cell = XLSX.utils.decode_cell(i);
    
        ws[i].s = { // styling for all cells
            font: {
                name: "arial"
            },
            alignment: {
                vertical: "center",
                horizontal: "center",
                wrapText: true, // any truthy value here
            },
            border: {
                right: {
                    style: "thin",
                    color: "000000"
                },
                left: {
                    style: "thin",
                    color: "000000"
                },
            }
        }

        //make linkable
        if(cell.c==4 && cell.r > 1)
            {
                var addrss = "D"+String(cell.r);
                ws[addrss].l = {Target:ws[addrss].v};
                

                
            }
    }
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
