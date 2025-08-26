const mainBlock = document.querySelector("#main-block");
const friendButton = document.querySelector("#friend-finder");
const access = localStorage.getItem("access");
const searchInput = document.querySelector("#search-input");

// создаём блоки динамически
const searchBlock = document.createElement("div");
searchBlock.id = "search-block";
const usersBlock = document.createElement("div");
usersBlock.id = "users-list";

// при первом клике вставим в DOM
function initFriendsUI() {
    if (!mainBlock.contains(searchBlock)) {
        mainBlock.appendChild(searchBlock);
    }
    if (!mainBlock.contains(usersBlock)) {
        mainBlock.appendChild(usersBlock);
    }
}

//тут я немножко поменял. у меня функция будет принимать юрл, но он по дефолту такой, какой мы и писали в fetch внизу
//это как раз нужно чтобы мы могли вызывать эту функцию с другим номером страницы в юрле
async function getFriends (url="/api/v1/users/") { 
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access}`
            }
        });

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }

        const apiData = await response.json();
        console.log(apiData.results[0])
        
        // я хз почему тут аватар все равно не отображается. но в деталях он отображается. пофиг крч я устал
        usersBlock.innerHTML = apiData.results.map(user => `
            <div class="user-card flex items-center gap-4 p-4 mb-3 bg-white border rounded-xl shadow hover:shadow-md transition" 
            data-user-id="${user.id}">
                <!-- Аватар -->
                <div class="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    ${user.avatar 
                        ? `<img src="${user.avatar.image}" alt="${user.username}" class="w-full h-full object-cover">` 
                        : `<span class="flex items-center justify-center w-full h-full text-gray-500">👤</span>`}
                </div>
                <!-- Инфо -->
                <div>
                    <div class="font-semibold text-gray-800">${user.username}</div>
                    <div class="text-sm text-gray-600">${user.first_name} ${user.last_name}</div>
                </div>
            </div>
        `).join("");
        
        const paginationBlock = document.createElement("div"); // создаем внизу общий див для кнопок
        paginationBlock.className = "flex gap-2 mt-4"; // стили от гптшки
        
        // это крч создаем объект класса URL, который поможет нам легче работать с юрл ссылкой
        const urlObj = new URL(url, window.location.origin);
        // вот как раз тут используем метод searchParams чтобы у этого юрл именно номер страницы взять
        // чтобы определить на какой мы странице. если там нет номера, значит мы на 1 странице
        const currentPage = parseInt(urlObj.searchParams.get("page")) || 1;
        // ну а тут мы просто математически общее кол-во страниц находим
        const totalPages = Math.ceil(apiData.count / 10);
        
        //создаем кнопку которая вернет нас в начало, если уже не видно кнопки для 1 страницы
        if (currentPage-4 > 1) {
            const firstBtn = document.createElement("button");
            firstBtn.textContent = "<<";
            firstBtn.className = "px-3 py-1 bg-gray-200 rounded hover:bg-gray-300";
            firstBtn.addEventListener("click", () => getFriends(`/api/v1/users/?page=${1}`));
            paginationBlock.appendChild(firstBtn);
        }

        // создаем кнопку назад которая будет видна если мы не на 1 странице
        if (currentPage > 1) {
            const prevBtn = document.createElement("button");
            prevBtn.textContent = "<";
            prevBtn.className = "px-3 py-1 bg-gray-200 rounded hover:bg-gray-300";
            prevBtn.addEventListener("click", () => getFriends(`/api/v1/users/?page=${currentPage - 1}`));
            paginationBlock.appendChild(prevBtn);
        }

        // создаем кнопки для страниц, но не всех, а только ближайших 4 с обоих сторон. рандомно выбрал это число
        for (let i = currentPage-4; i <= currentPage+4; i++) {
            if (i < 1 || i > totalPages) continue;
            const pageBtn = document.createElement("button");
            pageBtn.textContent = i;
            pageBtn.className = `px-3 py-1 rounded ${i === currentPage ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`;
            pageBtn.addEventListener("click", () => getFriends(`/api/v1/users/?page=${i}`));
            paginationBlock.appendChild(pageBtn);
        }

        // создаем кнопку вперед которая будет видна если мы не на последней странице
        if (currentPage < totalPages) {
            const nextBtn = document.createElement("button");
            nextBtn.textContent = ">";
            nextBtn.className = "px-3 py-1 bg-gray-200 rounded hover:bg-gray-300";
            nextBtn.addEventListener("click", () => getFriends(`/api/v1/users/?page=${currentPage + 1}`));
            paginationBlock.appendChild(nextBtn);
        }

        // создаем кнопку которая кинет нас в самый конец, если уже не видно кнопки посл страницы
        if (currentPage+4 < totalPages) {
            const lastBtn = document.createElement("button");
            lastBtn.textContent = ">>";
            lastBtn.className = "px-3 py-1 bg-gray-200 rounded hover:bg-gray-300";
            lastBtn.addEventListener("click", () => getFriends(`/api/v1/users/?page=${totalPages}`));
            paginationBlock.appendChild(lastBtn);
        }

        //ну и добавляем все это в наш юзерблок общий
        usersBlock.appendChild(paginationBlock);

        document.querySelectorAll(".user-card").forEach(card => {
            card.addEventListener("click", async () => {
                const userId = card.dataset.userId;
                console.log("Открываю профиль:", userId);

                try {
                    const response = await fetch(`/api/v1/users/${userId}/`, {
                        headers: {
                            "Authorization": `Bearer ${access}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`Ошибка ${response.status}`);
                    }

                    const userData = await response.json();
                    console.log("Детали пользователя:", userData);

                    // тут можешь перерисовать usersBlock под подробный профиль
                    usersBlock.innerHTML = `
                        <div class="p-4 border rounded-xl bg-white shadow">
                            <div class="flex items-center gap-4">
                                <div class="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                                    ${userData.avatar 
                                        ? `<img src="${userData.avatar.image}" alt="${userData.username}" class="w-full h-full object-cover">`
                                        : `<span class="flex items-center justify-center w-full h-full h-full text-gray-500">👤</span>`
                                    }
                                </div>
                                <div>
                                    <h2 class="text-xl font-bold">${userData.username}</h2>
                                    <p class="text-gray-600">${userData.first_name} ${userData.last_name}</p>
                                </div>
                            </div>
                            <div class="mt-4">
                                <p class="text-gray-700">Email: ${userData.email ?? "не указан"}</p>
                            </div>
                        </div>
                    `;
                } catch (err) {
                    console.error("Ошибка при получении пользователя:", err);
                }
            });
        });


    } catch (err) {
        console.error("Ошибка при запросе:", err);
        usersBlock.innerHTML = `<p style="color:red;">Не удалось загрузить пользователей</p>`;
    }
}

async function makeSearch (username) {
    try {
        const response = await fetch(`/api/v1/users/?search=${username}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access}`
            }
        });

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }

        const apiData = await response.json();
        console.log(apiData);
                usersBlock.innerHTML = apiData.results.map(user => `
            <div class="user-card flex items-center gap-4 p-4 mb-3 bg-white border rounded-xl shadow hover:shadow-md transition" 
            data-user-id="${user.id}">
                <!-- Аватар -->
                <div class="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    ${user.avatar 
                        ? `<img src="${user.avatar}" alt="${user.username}" class="w-full h-full object-cover">` 
                        : `<span class="flex items-center justify-center w-full h-full text-gray-500">👤</span>`}
                </div>
                <!-- Инфо -->
                <div>
                    <div class="font-semibold text-gray-800">${user.username}</div>
                    <div class="text-sm text-gray-600">${user.first_name} ${user.last_name}</div>
                </div>
            </div>
        `).join("");

        document.querySelectorAll(".user-card").forEach(card => {
            card.addEventListener("click", async () => {
                const userId = card.dataset.userId;
                console.log("Открываю профиль:", userId);

                try {
                    const response = await fetch(`/api/v1/users/${userId}/`, {
                        headers: {
                            "Authorization": `Bearer ${access}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`Ошибка ${response.status}`);
                    }

                    const userData = await response.json();
                    console.log("Детали пользователя:", userData);

                    // тут можешь перерисовать usersBlock под подробный профиль
                    usersBlock.innerHTML = `
                        <div class="p-4 border rounded-xl bg-white shadow">
                            <div class="flex items-center gap-4">
                                <div class="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                                    ${userData.avatar 
                                        ? `<img src="${userData.avatar.image}" alt="${userData.username}" class="w-full h-full object-cover">`
                                        : `<span class="flex items-center justify-center w-full h-full h-full text-gray-500">👤</span>`
                                    }
                                </div>
                                <div>
                                    <h2 class="text-xl font-bold">${userData.username}</h2>
                                    <p class="text-gray-600">${userData.first_name} ${userData.last_name}</p>
                                </div>
                            </div>
                            <div class="mt-4">
                                <p class="text-gray-700">Email: ${userData.email ?? "не указан"}</p>
                            </div>
                        </div>
                    `;
                } catch (err) {
                    console.error("Ошибка при получении пользователя:", err);
                }
            });
        });

    } catch (err) {
        console.error("Ошибка при запросе:", err);
        usersBlock.innerHTML = `<p style="color:red;">Не удалось загрузить пользователей</p>`;
    }
}

function renderSearch() {
    searchBlock.innerHTML = `
        <div class="mb-4">
            <div class="flex gap-2">
                <input 
                    id="search-input"
                    type="text" 
                    placeholder="Поиск друзей..." 
                    class="flex-1 p-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-300 focus:outline-none"
                >
                <button 
                    id="search-btn"
                    class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                    Искать
                </button>
            </div>
        </div>
    `;

    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-btn");

    searchBtn.addEventListener("click", (e) => {
        e.preventDefault();
        makeSearch(searchInput.value.trim());
    });
};

friendButton.addEventListener("click", async (e) => {
    e.preventDefault();
    initFriendsUI();
    renderSearch();
    await getFriends();
});
