/**
 * Filters the publications based on the start and end year, and author name.
 * @function applyFilters
 */
function applyFilters() {
    const startYear = parseInt(document.getElementById("startYear").value) || 1800;
    const endYear = parseInt(document.getElementById("endYear").value) || 9999;
    const authorName = document.getElementById("authorName").value.trim().toLowerCase();

    if (endYear < startYear) return;

    // Filter publications based on both year and author name
    const filteredPublications = originalPublications.filter(pub => {
        const pubYear = parseInt(pub.year);
        const withinYearRange = (!isNaN(startYear) ? pubYear >= startYear : true) &&
            (!isNaN(endYear) ? pubYear <= endYear : true);
        const authorMatches = !authorName || pub.authors.toLowerCase().includes(authorName);
        return withinYearRange && authorMatches;
    });

    // Re-render the table with filtered results
    window.publications = filteredPublications; // Update the publications array with the filtered results
    displayPublications(filteredPublications);
}

/**
 * Filters the publications based on the start and end year.
 * @function applyYearFilter
 */
function applyYearFilter() {
    applyFilters();
}

/**
 * Filters the publications based on the author name.
 * @function applyNameFilter
 */
function applyNameFilter() {
    applyFilters();
}
