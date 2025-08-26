document.addEventListener("DOMContentLoaded", () => {
  const regBtn = document.getElementById("reg-btn");
  const regModal = document.getElementById("registerModal");
  const cancelBtn = document.getElementById("register-cancel");
  const regForm = document.getElementById("register-form");

  // открыть модалку
  regBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    regModal.showModal();
  });

  // закрыть модалку
  cancelBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    regModal.close();
  });

  regForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(regForm);

    try {
      let avatarId = null;

      // загружаем фото, если оно выбрано
      const avatarFile = formData.get("avatar");
      if (avatarFile && avatarFile.size > 0) {
        const imgData = new FormData();
        imgData.append("image", avatarFile);
        // запрос на имейджес
        const imgResp = await fetch("/api/v1/images/", {
          method: "POST",
          body: imgData,
        });
        // на случай какой-то ошибки загрузки фото
        if (!imgResp.ok) {
          const err = await imgResp.json().catch(() => ({}));
          alert("Ошибка загрузки фото: " + (err.detail || imgResp.status));
          return;
        }
        // если все норм, достаем айди этой фотки, по которому она сохранена в модели имейджес (как я понимаю)
        const imgJson = await imgResp.json();
        avatarId = imgJson.id;

        // тут вот я решил просто удалить файл из формдаты и засунуть вместо него айди, но гпт мне советовала подругому сделать
        formData.delete("avatar");
        formData.append("avatar_id", avatarId); // важно что называается аватар_айди потому что в сериализаторе так называется
      }

      // отправляем форму на регистрацию
      const resp = await fetch("/api/v1/registration/", {
        method: "POST",
        body: formData,
      });

      // вот так мне гпт советовала сделать. создать новый дикт, туда выгрузить данные из формдаты и его уже загрузить
      // но хз зачем все это, просто так усложнять, когда можно просто формдату использовать

      // const userPayload = {
      //   username: formData.get("username"),
      //   email: formData.get("email"),
      //   password: formData.get("password"),
      //   first_name: formData.get("first_name"),
      //   last_name: formData.get("last_name"),
      // };

      // if (avatarId) {
      //   userPayload.avatar = avatarId;
      // }

      // const resp = await fetch("/api/v1/registration/", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(userPayload),
      // });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        alert("Ошибка: " + (err.detail || resp.status));
        return;
      }

      alert("Регистрация успешна!");
      regModal.close();
    } catch (err) {
      alert("Ошибка соединения: " + err);
    }
  });
});
