const form = document.querySelector(".auth_form");

form.addEventListener("submit", async (e) => {
    e.preventDefault(); 
    // не даём форме перезагрузить страницу
    const formData = new FormData(form);
    // формируем объект
    const payload = {
        username: formData.get("username"),
        password: formData.get("password")
    };
    try {
        const response = await fetch("/api/token/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // "X-CSRFToken": getCookie("csrftoken") 
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }
        const data = await response.json();
        console.log("Успешный логин:", data);
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
    } catch (err) {
        console.error("Ошибка при запросе:", err);
    }
});