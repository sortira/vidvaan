function exportArrayToWord(arrayOfArray,col){
    var header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
         "xmlns:w='urn:schemas-microsoft-com:office:word' "+
         "xmlns='http://www.w3.org/TR/REC-html40'>"+
         "<head><meta charset='utf-8'><title>Report</title></head><body>";
    var footer = "</font></table></body></html>";
    var inHtml = "<table border = 10><font size = 2>";
   
    for(let i = 0;i < arrayOfArray.length;i++) {
          inHtml += "<tr border = 10>";
          for(let j = 0;j <col;j++)
               {
                    /*if(j == 4)
                         {
                              continue;
                         }*/
                    
                    if(j == 3 && i > 0)
                         {
                              inHtml += "<td fontsize = 2 border = 10><a href=\""+arrayOfArray[i][j]+"\">link</a></td>";
                         }
                    else
                    {
                         inHtml += "<td border = 10>"+arrayOfArray[i][j]+"</td>";
                    }
               }
          inHtml+= "</tr>";


    }
    if(aiSumText.length > 3)
        {
            aiSumText = "<h2>AI SUMMARY:</h2><p><font size = 3>" + aiSumText + "</p></font><br><br>";
        }
    var sourceHTML = header+aiSumText+inHtml+footer;
    console.log(sourceHTML);
    var source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    var fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'document.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
 }

function exportWord()
{
     const pubarr = originalPublications.map((obj) => { return Object.keys(obj).map((key) => { return obj[key]; }); });
     pubarr.unshift(["Name     ", "Year    ", "Authors        ", "Link             ", "Summary   ","Academic Database"]);
     exportArrayToWord(pubarr,6);
}

