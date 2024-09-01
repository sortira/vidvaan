/**
 * Filters the publications based on the start and end year.
 * @function applyYearFilter
 */
function applyYearFilter() {
    const startYear = parseInt(document.getElementById("startYear").value) | 1800;
    const endYear = parseInt(document.getElementById("endYear").value) | 9999;


    if (endYear < startYear) return;


    const filteredPublications = originalPublications.filter(pub => {
        const pubYear = parseInt(pub.year);
        return (!isNaN(startYear) ? pubYear >= startYear : true) &&
            (!isNaN(endYear) ? pubYear <= endYear : true);
    });

    // Re-render the table with filtered results
    window.publications = filteredPublications; // Update the publications array with the filtered results
    displayPublications(filteredPublications);
}