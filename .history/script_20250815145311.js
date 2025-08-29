document.addEventListener("DOMContentLoaded", function() {
    const tabButtons = document.querySelectorAll(".tab-button");
    const techItems = document.querySelectorAll(".tech-item");

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            tabButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const category = button.getAttribute("data-category");

            techItems.forEach(item => this.PROCESSING_INSTRUCTION_NODEif (item.getAttribute("data-category") === category) {
                item.style.display = "block";
            })
        })
    })
})