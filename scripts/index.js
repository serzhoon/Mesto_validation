// ======== Настройки валидации ========
const validationSettings = {
    formSelector: '.popup__form',
    inputSelector: '.popup__input',
    submitButtonSelector: '.popup__button',
    inactiveButtonClass: 'popup__button_disabled',
    inputErrorClass: 'popup__input_type_error',
    errorClass: 'popup__error_visible'
};

// ======== Функции валидации ========
function showInputError(formElement, inputElement, errorMessage, settings) {
    const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
    inputElement.classList.add(settings.inputErrorClass);
    errorElement.textContent = errorMessage;
    errorElement.classList.add(settings.errorClass);
}

function hideInputError(formElement, inputElement, settings) {
    const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
    inputElement.classList.remove(settings.inputErrorClass);
    errorElement.classList.remove(settings.errorClass);
    errorElement.textContent = '';
}

function checkInputValidity(formElement, inputElement, settings) {
    if (!inputElement.validity.valid) {
        showInputError(formElement, inputElement, inputElement.validationMessage, settings);
    } else {
        hideInputError(formElement, inputElement, settings);
    }
}

function toggleButtonState(inputList, buttonElement, settings) {
    const hasInvalidInput = inputList.some(inputElement => !inputElement.validity.valid);

    if (hasInvalidInput) {
        buttonElement.classList.add(settings.inactiveButtonClass);
        buttonElement.disabled = true;
    } else {
        buttonElement.classList.remove(settings.inactiveButtonClass);
        buttonElement.disabled = false;
    }
}

function setEventListeners(formElement, settings) {
    const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
    const buttonElement = formElement.querySelector(settings.submitButtonSelector);

    // Начальное состояние кнопки
    toggleButtonState(inputList, buttonElement, settings);

    inputList.forEach(inputElement => {
        inputElement.addEventListener('input', () => {
            checkInputValidity(formElement, inputElement, settings);
            toggleButtonState(inputList, buttonElement, settings);
        });
    });
}

function enableValidation(settings) {
    const formList = Array.from(document.querySelectorAll(settings.formSelector));
    formList.forEach(formElement => {
        setEventListeners(formElement, settings);
    });
}

// ======== Функции для карточек ========
function createCard(cardData, deleteCallback, likeCallback, openImageCallback) {
    const cardTemplate = document.querySelector('#card-template').content;
    const cardElement = cardTemplate.querySelector('.card').cloneNode(true);

    const cardImage = cardElement.querySelector('.card__image');
    const cardTitle = cardElement.querySelector('.card__title');
    const deleteButton = cardElement.querySelector('.card__delete-button');
    const likeButton = cardElement.querySelector('.card__like-button');

    cardImage.src = cardData.link;
    cardImage.alt = cardData.name;
    cardTitle.textContent = cardData.name;

    deleteButton.addEventListener('click', () => deleteCallback(cardElement));
    likeButton.addEventListener('click', likeCallback);
    cardImage.addEventListener('click', () => openImageCallback(cardData));

    return cardElement;
}

function deleteCard(cardElement) {
    cardElement.remove();
}

function likeCard(evt) {
    evt.target.classList.toggle('card__like-button_is-active');
}

// ======== Функции для модальных окон ========
function openModal(popup) {
    popup.classList.add('popup_is-opened');
    document.addEventListener('keydown', closeByEscape);
}

function closeModal(popup) {
    popup.classList.remove('popup_is-opened');
    document.removeEventListener('keydown', closeByEscape);
}

function closeByEscape(evt) {
    if (evt.key === 'Escape') {
        const openedPopup = document.querySelector('.popup_is-opened');
        if (openedPopup) closeModal(openedPopup);
    }
}

// ======== Основной код ========
document.addEventListener('DOMContentLoaded', () => {
    // Включение валидации
    enableValidation(validationSettings);

    // DOM элементы
    const cardTemplate = document.querySelector('#card-template').content;
    const profileEditButton = document.querySelector('.profile__edit-button');
    const addCardButton = document.querySelector('.profile__add-button');
    const placesList = document.querySelector('.places__list');
    const profilePopup = document.querySelector('.popup_type_edit');
    const cardPopup = document.querySelector('.popup_type_new-card');
    const imagePopup = document.querySelector('.popup_type_image');
    const profileForm = document.forms['edit-profile'];
    const cardForm = document.forms['new-place'];
    const profileName = document.querySelector('.profile__title');
    const profileDescription = document.querySelector('.profile__description');
    const nameInput = profileForm.querySelector('.popup__input_type_name');
    const jobInput = profileForm.querySelector('.popup__input_type_description');
    const popupImage = imagePopup.querySelector('.popup__image');
    const popupCaption = imagePopup.querySelector('.popup__caption');

    // Функция открытия изображения
    function openImagePopup(cardData) {
        popupImage.src = cardData.link;
        popupImage.alt = cardData.name;
        popupCaption.textContent = cardData.name;
        openModal(imagePopup);
    }

    // Рендер карточки
    function renderCard(cardData, container) {
        const card = createCard(cardData, deleteCard, likeCard, openImagePopup);
        container.prepend(card);
    }

    // Обработчики событий
    profileEditButton.addEventListener('click', () => {
        nameInput.value = profileName.textContent;
        jobInput.value = profileDescription.textContent;
        openModal(profilePopup);
    });

    addCardButton.addEventListener('click', () => {
        cardForm.reset();
        openModal(cardPopup);
    });

    profileForm.addEventListener('submit', (evt) => {
        evt.preventDefault();
        profileName.textContent = nameInput.value;
        profileDescription.textContent = jobInput.value;
        closeModal(profilePopup);
    });

    cardForm.addEventListener('submit', (evt) => {
        evt.preventDefault();

        const newCard = {
            name: cardForm.elements['place-name'].value,
            link: cardForm.elements.link.value
        };

        renderCard(newCard, placesList);
        closeModal(cardPopup);
        cardForm.reset();
    });

    // Закрытие попапов
    document.querySelectorAll('.popup').forEach(popup => {
        popup.addEventListener('mousedown', (evt) => {
            if (evt.target.classList.contains('popup_is-opened') ||
                evt.target.classList.contains('popup__close')) {
                closeModal(popup);
            }
        });
    });

    // Добавление анимации для попапов
    document.querySelectorAll('.popup').forEach(popup => {
        popup.classList.add('popup_is-animated');
    });

    // Вывод карточек на страницу
    initialCards.forEach(card => {
        renderCard(card, placesList);
    });
});