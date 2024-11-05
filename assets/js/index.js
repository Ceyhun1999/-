window.addEventListener("scroll", () => {
    if (document.documentElement.scrollTop > 0) {
        document.querySelector(".section-bottom").classList.add("header-active");
    } else {
        document.querySelector(".section-bottom").classList.remove("header-active");
    }
});

// Swiper start
const swiperHeader = new Swiper(".swiper-header", {
    loop: true,
    // autoplay: true,
    navigation: {
        nextEl: ".button-prev",
        prevEl: ".button-next",
    },
    scrollbar: {
        el: ".swiper-scrollbar",
    },
});

// fixedIconWrapper
const openFixed = document.querySelector(".fixed__open-close-icon-wrapper");
const iconWrapper = document.querySelector(".fixed-icon-wrapper");

openFixed.addEventListener("click", () => {
    iconWrapper.classList.toggle("active");
});

const scrollToTopBtn = document.getElementById("scrollToTopBtn");

window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
        scrollToTopBtn.style.display = "block";
    } else {
        scrollToTopBtn.style.display = "none";
    }
});

// Düyməyə klik edildikdə yuxarıya sürüşdür
scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth", // Yumşaq keçid effekti
    });
});
Fancybox.bind("[data-fancybox]", {
    // Your custom options
});

// const form = document.getElementById("registration");

// form.addEventListener("submit", (e) => {
//   e.preventDefault();

//   const form = new FormData(e.target);

//   const data = {
//     name: form.get("name"),
//     email: form.get("email"),
//     password1: form.get("password1"),
//     password2: form.get("password2"),
//   };

//   fetch("https://metko.io/engine/modules/register_simple.php", {
//     method: "POST",
//     body: JSON.stringify(data),
//   })
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error("Sorğu zamanı səhv baş verdi: " + response.statusText);
//       }
//       return response.json();
//     })
//     .then((result) => {
//       console.log("Müvəffəqiyyətlə göndərildi:", result);
//     })
//     .catch((error) => {
//       console.error("Göndərmə zamanı xəta:", error);
//     });
// });
// nokix

// naduj@mailinator.com

// Pa$$w0rd!


document.getElementById("orderBtn").addEventListener("click", function() {
    // Закрытие модального окна
   
    setTimeout(function() {
    var element = document.getElementById("questionnaire");
    var elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    var offsetPosition = elementPosition - 150; // Отступ в 50 пикселей

    window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
    });
}, 300); // Задержка 300 миллисекунд
});
