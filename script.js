/* =========================================================
   MathMind AI
   النسخة التجريبية الكاملة
   ========================================================= */


/* ================= بيانات المنصة ================= */

let appData = {
    solved: 0,
    points: 0,
    questionNumber: 1,
    totalQuestions: 5,
    hintsUsed: 0
};


/* ================= تحميل البيانات ================= */

function loadData() {

    const savedData = localStorage.getItem("mathmindData");

    if (savedData) {
        try {
            appData = {
                ...appData,
                ...JSON.parse(savedData)
            };
        } catch (error) {
            console.log("بدأنا ببيانات جديدة.");
        }
    }

    updateProgressUI();
}


/* ================= حفظ البيانات ================= */

function saveData() {
    localStorage.setItem(
        "mathmindData",
        JSON.stringify(appData)
    );
}


/* ================= التنقل بين الصفحات ================= */

function showPage(pageId) {

    const pages = document.querySelectorAll(".page");

    pages.forEach(function(page) {
        page.classList.remove("active-page");
    });

    const targetPage = document.getElementById(pageId);

    if (targetPage) {
        targetPage.classList.add("active-page");
    }

    const navButtons = document.querySelectorAll(".nav-btn");

    navButtons.forEach(function(button) {
        button.classList.remove("active");
    });

    const matchingButton = Array.from(navButtons).find(function(button) {
        return button.getAttribute("onclick") === `showPage('${pageId}')`;
    });

    if (matchingButton) {
        matchingButton.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (pageId === "progress") {
        updateProgressUI();
    }
}


/* ================= تحديث التقدم ================= */

function updateProgressUI() {

    const solved = Math.min(
        appData.solved,
        appData.totalQuestions
    );

    const percentage = Math.round(
        (solved / appData.totalQuestions) * 100
    );

    const statSolved = document.getElementById("statSolved");
    const statPoints = document.getElementById("statPoints");
    const statPercent = document.getElementById("statPercent");

    const solvedCount = document.getElementById("solvedCount");
    const goalFill = document.getElementById("goalFill");

    if (statSolved) {
        statSolved.textContent = solved;
    }

    if (statPoints) {
        statPoints.textContent = appData.points;
    }

    if (statPercent) {
        statPercent.textContent = percentage + "%";
    }

    if (solvedCount) {
        solvedCount.textContent =
            solved + " / " + appData.totalQuestions;
    }

    if (goalFill) {
        goalFill.style.width = percentage + "%";
    }
}


/* ================= السؤال ================= */

function checkAnswer() {

    const input = document.getElementById("answerInput");
    const feedback = document.getElementById("feedback");

    if (!input || !feedback) {
        return;
    }

    const answer = input.value.trim();

    if (answer === "") {

        feedback.className = "feedback warning";
        feedback.innerHTML =
            "✦ اكتبي محاولة أولًا. لا نريد منك الإجابة بسرعة، نريد أن نعرف كيف تفكرين.";

        return;
    }


    /*
       السؤال:
       f(x) = 2x + 3
       f(4) = 2(4) + 3 = 11
    */

    const numericAnswer = Number(answer);

    if (numericAnswer === 11) {

        feedback.className = "feedback success";

        feedback.innerHTML =
            "✓ ممتاز! محاولتك صحيحة. لاحظي أنك عوّضتِ قيمة x في الدالة بشكل صحيح.";


        if (appData.solved < appData.totalQuestions) {
            appData.solved += 1;
            appData.points += 10;
        }

        saveData();
        updateProgressUI();

        input.disabled = true;

        const progress = document.getElementById("questionProgress");

        if (progress) {
            const percentage =
                Math.min(
                    (appData.solved / appData.totalQuestions) * 100,
                    100
                );

            progress.style.width = percentage + "%";
        }

    } else {

        feedback.className = "feedback warning";

        feedback.innerHTML =
            "حاولي مرة ثانية. ✦ اسألي نفسك: عندما نعوّض x = 4، ماذا تصبح قيمة 2x أولًا؟";
    }
}


/* ================= التلميح ================= */

function giveHint() {

    const feedback = document.getElementById("feedback");

    if (!feedback) {
        return;
    }

    appData.hintsUsed += 1;

    feedback.className = "feedback warning";

    feedback.innerHTML =
        "💡 التلميح: ابدئي بالتعويض عن x بالقيمة 4 داخل الدالة. " +
        "اكتبي التعبير الجديد قبل إجراء عملية الجمع.";

    saveData();
}


/* ================= AI ================= */

function handleAIEnter(event) {

    if (event.key === "Enter") {
        askAI();
    }
}


function askAI() {

    const input = document.getElementById("aiInput");

    if (!input) {
        return;
    }

    const question = input.value.trim();

    if (question === "") {
        return;
    }

    addUserMessage(question);

    input.value = "";

    setTimeout(function() {
        generateAIResponse(question);
    }, 500);
}


function quickQuestion(question) {

    const input = document.getElementById("aiInput");

    if (!input) {
        return;
    }

    input.value = question;

    askAI();
}


function addUserMessage(text) {

    const chat = document.getElementById("chatMessages");

    if (!chat) {
        return;
    }

    const message = document.createElement("div");

    message.className = "user-message";

    message.innerHTML = `
        <p>${escapeHTML(text)}</p>
    `;

    chat.appendChild(message);

    scrollChatToBottom();
}


function addAIMessage(text) {

    const chat = document.getElementById("chatMessages");

    if (!chat) {
        return;
    }

    const message = document.createElement("div");

    message.className = "ai-message";

    message.innerHTML = `
        <div class="ai-avatar">∫</div>

        <div class="message-content">
            <span class="message-name">MathMind AI</span>
            <p>${text}</p>
        </div>
    `;

    chat.appendChild(message);

    scrollChatToBottom();
}


function generateAIResponse(question) {

    const lowerQuestion = question.toLowerCase();

    let response;


    if (
        lowerQuestion.includes("أبدأ") ||
        lowerQuestion.includes("ابدأ") ||
        lowerQuestion.includes("من أين")
    ) {

        response =
            "خلينا نبدأ من غير ما نحاول نحل السؤال مباشرة. " +
            "اقرئي السؤال وحددي شيئين: <strong>ما المعطيات؟</strong> " +
            "و<strong>ما المطلوب؟</strong>.<br><br>" +
            "اكتبي لي هذين الأمرين، وأنا أساعدك بالخطوة التالية.";

    } else if (
        lowerQuestion.includes("قانون") ||
        lowerQuestion.includes("القانون")
    ) {

        response =
            "قبل اختيار القانون، اسألي نفسك: " +
            "ما الكمية التي نريد إيجادها؟ وما المعلومات التي أعطاها السؤال؟<br><br>" +
            "اكتبي لي المعطيات الموجودة في السؤال، وسنحدد معًا " +
            "أي نوع من القوانين يمكن أن يناسبها.";

    } else if (
        lowerQuestion.includes("أخطأت") ||
        lowerQuestion.includes("غلط") ||
        lowerQuestion.includes("خطأ")
    ) {

        response =
            "ممتاز أنك لاحظتِ احتمال وجود خطأ. 👏 " +
            "بدل ما أعطيك التصحيح، أريدك تراجعي آخر خطوة كتبتِها.<br><br>" +
            "هل نقلتِ الأرقام والإشارات كما هي من السؤال؟ " +
            "أرسلي لي آخر خطوة وصلتِ إليها.";

    } else if (
        lowerQuestion.includes("صحيحة") ||
        lowerQuestion.includes("صح")
    ) {

        response =
            "أقدر أراجع طريقة تفكيرك، لكن لن أعطيك الإجابة مباشرة. " +
            "أرسلي الخطوات التي اتبعتها، وسأخبرك عند أي خطوة تحتاجين إلى إعادة التفكير.";

    } else {

        response =
            "خلينا نفكك السؤال بدل ما أعطيك الحل. ✦<br><br>" +
            "أول سؤال لك: <strong>ما الشيء المطلوب منك إيجاده؟</strong><br><br>" +
            "اكتبي المطلوب فقط، وبعدها ننتقل للخطوة التالية.";
    }


    addAIMessage(response);
}


function scrollChatToBottom() {

    const chat = document.querySelector(".ai-chat");

    if (chat) {
        chat.scrollTop = chat.scrollHeight;
    }
}


/* ================= حماية النصوص ================= */

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* ================= تشغيل المنصة ================= */

document.addEventListener("DOMContentLoaded", function() {

    loadData();

    showPage("home");

});
function saveStudentProfile() {
    const name = document.getElementById("studentName").value.trim();
    const grade = document.getElementById("studentGrade").value;
    const section = document.getElementById("studentSection").value;
    const number = document.getElementById("studentNumber").value.trim();

    const message = document.getElementById("registerMessage");

    if (!name || !grade || !section || !number) {
        message.classList.remove("hidden");
        message.style.background = "#fde8e6";
        message.style.color = "#a91f17";
        message.textContent = "⚠️ تأكدي من تعبئة جميع البيانات أولًا.";
        return;
    }

    const studentProfile = {
        name: name,
        grade: grade,
        section: section,
        number: number
    };

    localStorage.setItem(
        "mathmindStudentProfile",
        JSON.stringify(studentProfile)
    );

    message.classList.remove("hidden");
    message.style.background = "#e8f6ea";
    message.style.color = "#21652a";
    message.textContent = "✓ تم إنشاء ملفك بنجاح! أهلاً بك في MathMind AI.";

    setTimeout(() => {
        showPage("units");
    }, 900);
}