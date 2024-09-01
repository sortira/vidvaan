/**
         * Filters the publications based on the author name.
         * @function applyNameFilter
         */
function applyNameFilter() {
    const authorName = document.getElementById("authorName").value.trim().toLowerCase();

    if (!authorName) {
        displayPublications(originalPublications);
        return;
    }

    const filteredPublications = originalPublications.filter(pub => {
        const authors = pub.authors.toLowerCase();
        return authors.includes(authorName);
    });

    // Re-render the table with filtered results
    window.publications = filteredPublications; // Update the publications array with the filtered results
    displayPublications(filteredPublications);
}