function scaleContent() {
    const wrapper = document.querySelector('.scale-wrapper');
    
    if (!wrapper) {
        console.warn('Scale wrapper not found');
        return;
    }
    
    const baseWidth = 2600;
    const currentWidth = window.innerWidth;
    
    if (currentWidth > 767 && currentWidth < baseWidth) {
        const scale = (currentWidth + 30) / (baseWidth + 60) * 1.35;
        const scaledWidth = baseWidth * scale;
        const leftOffset = (currentWidth - scaledWidth) / 2;
        
        console.log(`Scale: ${scale}, Current: ${currentWidth}, Scaled: ${scaledWidth}, Offset: ${leftOffset}`);
        
        wrapper.style.transform = `scale(${scale})`;
        wrapper.style.transformOrigin = 'top left';
        wrapper.style.width = `${baseWidth}px`;
        wrapper.style.position = 'relative';
        wrapper.style.left = `${leftOffset}px`;
        wrapper.style.marginLeft = '0';
        
        const scaledHeight = wrapper.offsetHeight * scale;
        document.body.style.height = `${scaledHeight}px`;
        
        document.body.style.overflowX = 'hidden';
    } else if (currentWidth <= 767) {
        wrapper.style.transform = 'none';
        wrapper.style.width = '100%';
        wrapper.style.position = 'relative';
        wrapper.style.left = '0';
        wrapper.style.marginLeft = '0';
        document.body.style.height = 'auto';
        document.body.style.overflowX = 'hidden';
    } else {
        wrapper.style.transform = 'none';
        wrapper.style.width = `${baseWidth}px`;
        wrapper.style.position = 'relative';
        wrapper.style.left = '0';
        wrapper.style.marginLeft = '0';
        document.body.style.height = 'auto';
        document.body.style.overflowX = 'hidden';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('js-enabled');
    scaleContent();
});

document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.querySelector('.cart-date-input');
    if (!dateInput) return;

    const dp = document.createElement('div');
    dp.className = 'custom-datepicker hidden';
    dp.innerHTML = `
        <div class="custom-datepicker-header">
            <button type="button" class="custom-datepicker-nav dp-prev" aria-label="Предыдущий месяц">
                <img src="img/arrow_down.svg" class="rotate-left" alt="Prev">
            </button>
            <div class="custom-datepicker-title"></div>
            <button type="button" class="custom-datepicker-nav dp-next" aria-label="Следующий месяц">
                <img src="img/arrow_down.svg" class="rotate-right" alt="Next">
            </button>
        </div>
        <div class="custom-datepicker-weekdays"></div>
        <div class="custom-datepicker-grid"></div>
    `;
    document.body.appendChild(dp);

    const titleEl = dp.querySelector('.custom-datepicker-title');
    const prevBtn = dp.querySelector('.dp-prev');
    const nextBtn = dp.querySelector('.dp-next');
    const weekdaysEl = dp.querySelector('.custom-datepicker-weekdays');
    const gridEl = dp.querySelector('.custom-datepicker-grid');

    const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
    const WEEKDAYS = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
    weekdaysEl.innerHTML = WEEKDAYS.map(d => `<div class="custom-datepicker-weekday">${d}</div>`).join('');

    let current = new Date();
    let selected = null;
    if (dateInput.value) {
        const [y,m,d] = dateInput.value.split('-').map(Number);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
            selected = { year: y, month: m - 1, day: d };
            current = new Date(y, m - 1, d);
        }
    }

    function pad(v) { return String(v).padStart(2, '0'); }
    function formatISO(y, m, d) { return `${y}-${pad(m+1)}-${pad(d)}`; }

    function render() {
        const year = current.getFullYear();
        const month = current.getMonth();
        titleEl.textContent = `${MONTHS[month]} ${year}`;

        gridEl.innerHTML = '';
        const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Пн = 0
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysPrev = new Date(year, month, 0).getDate();

        for (let i = 0; i < 42; i++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'custom-datepicker-day';

            let dayNumber, showYear = year, showMonth = month;
            let disabled = false;

            if (i < firstDayIndex) {
                dayNumber = daysPrev - firstDayIndex + 1 + i;
                disabled = true;
                showMonth = month - 1;
                if (showMonth < 0) { showMonth = 11; showYear--; }
            } else if (i >= firstDayIndex + daysInMonth) {
                dayNumber = i - (firstDayIndex + daysInMonth) + 1;
                disabled = true;
                showMonth = month + 1;
                if (showMonth > 11) { showMonth = 0; showYear++; }
            } else {
                dayNumber = i - firstDayIndex + 1;
            }

            btn.textContent = dayNumber;

            if (disabled) {
                btn.classList.add('disabled');
            } else {
                if (selected && selected.year === year && selected.month === month && selected.day === dayNumber) {
                    btn.classList.add('selected');
                }
                btn.addEventListener('click', () => {
                    selected = { year, month, day: dayNumber };
                    dateInput.value = formatISO(year, month, dayNumber);
                    closePicker();
                });
            }

            gridEl.appendChild(btn);
        }
    }

    function positionPicker() {
        const rect = dateInput.getBoundingClientRect();
        dp.style.left = `${rect.left}px`;
        dp.style.top = `${rect.bottom + 8}px`;
    }

    function openPicker() {
        positionPicker();
        dp.classList.remove('hidden');
        render();
    }

    function closePicker() {
        dp.classList.add('hidden');
    }

    prevBtn.addEventListener('click', () => {
        current.setMonth(current.getMonth() - 1);
        render();
    });
    nextBtn.addEventListener('click', () => {
        current.setMonth(current.getMonth() + 1);
        render();
    });

    dateInput.addEventListener('focus', openPicker);
    dateInput.addEventListener('click', openPicker);
    window.addEventListener('resize', positionPicker);
    document.addEventListener('scroll', positionPicker, { passive: true });

    document.addEventListener('click', (e) => {
        if (!dp.contains(e.target) && e.target !== dateInput) {
            closePicker();
        }
    });
});

window.addEventListener('resize', scaleContent);

let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(scaleContent, 100);
});

window.addEventListener('orientationchange', function() {
    setTimeout(scaleContent, 200);
});

window.addEventListener('focus', scaleContent);

let checkCounter = 0;
const intervalCheck = setInterval(function() {
    scaleContent();
    checkCounter++;
    if (checkCounter >= 10) {
        clearInterval(intervalCheck);
    }
}, 500);

// 3. Слайдер каталога
document.addEventListener('DOMContentLoaded', function() {
    const track = document.querySelector('.catalog-track');
    const cards = document.querySelectorAll('.catalog-card');
    const prevBtn = document.querySelector('.catalog-arrow-prev-bottom');
    const nextBtn = document.querySelector('.catalog-arrow-next-bottom');
    const dots = document.querySelectorAll('.catalog-dot');
    const slider = document.querySelector('.catalog-slider');
    
    if (!track || !cards.length || !prevBtn || !nextBtn || !slider) return;
    
    let currentIndex = 0;
    let cardsPerView = 4;
    const totalCards = cards.length;
    const cardWidth = 325;
    const gap = 68;
    
    function calculateCardsPerView() {
        const containerWidth = slider.offsetWidth;
        if (containerWidth >= 1340) {
            cardsPerView = 4;
        } else if (containerWidth >= 1000) {
            cardsPerView = 3;
        } else if (containerWidth >= 670) {
            cardsPerView = 2;
        } else {
            cardsPerView = 2;
        }
        updateSlider();
    }
    
    function updateSlider() {
        const offset = currentIndex * (cardWidth + gap);
        track.style.transform = `translateX(-${offset}px)`;
        
        const totalPages = Math.ceil(totalCards / cardsPerView);
        const currentPage = Math.floor(currentIndex / cardsPerView);
        
        dots.forEach((dot, index) => {
            if (index < totalPages) {
                dot.style.display = 'block';
                dot.classList.toggle('active', index === currentPage);
            } else {
                dot.style.display = 'none';
            }
        });
        
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex + cardsPerView >= totalCards;
    }
      
    prevBtn.addEventListener('click', function() {
        if (currentIndex > 0) {
            currentIndex = Math.max(0, currentIndex - cardsPerView);
            updateSlider();
        }
    });
    
    nextBtn.addEventListener('click', function() {
        if (currentIndex + cardsPerView < totalCards) {
            currentIndex = Math.min(totalCards - cardsPerView, currentIndex + cardsPerView);
            updateSlider();
        }
    });
 
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            currentIndex = index * cardsPerView;
            if (currentIndex + cardsPerView > totalCards) {
                currentIndex = totalCards - cardsPerView;
            }
            updateSlider();
        });
    });
    
    calculateCardsPerView();
    window.addEventListener('resize', calculateCardsPerView);
 
    let isDragging = false;
    let startX;
    let scrollLeft;
    
    slider.addEventListener('mousedown', function(e) {
        isDragging = true;
        slider.style.cursor = 'grabbing';
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    
    slider.addEventListener('mouseleave', function() {
        isDragging = false;
        slider.style.cursor = 'grab';
    });
    
    slider.addEventListener('mouseup', function() {
        isDragging = false;
        slider.style.cursor = 'grab';
    });
    
    slider.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walk;
    });
    
    slider.style.cursor = 'grab';
});

document.addEventListener('DOMContentLoaded', function() {
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModalBtn = document.getElementById('closeModal');
    const catalogCards = document.querySelectorAll('.catalog-card');
    
    catalogCards.forEach(function(card) {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.catalog-card-button')) {
                modalOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    closeModalBtn.addEventListener('click', function(e) {
        e.preventDefault();
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const showMoreBtn = document.getElementById('reviewsShowMore');
    const reviewsGlobal1 = document.querySelector('.reviews-global1');
    const secondReview = document.querySelector('.reviews-card-title-card:last-child');
    
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', function() {
            if (secondReview) {
                secondReview.classList.add('show-review');
            }
            
            if (reviewsGlobal1) {
                reviewsGlobal1.classList.add('show-more');
            }
            
            showMoreBtn.style.display = 'none';
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const logoImages = document.querySelectorAll('.logo img');
    logoImages.forEach(function(img) {
        const originalSrc = img.src;
        const activeSrc = originalSrc.replace('logo.png', 'logo2.png');
        
        img.addEventListener('mousedown', function() {
            img.src = activeSrc;
        });
        
        img.addEventListener('mouseup', function() {
            img.src = originalSrc;
        });
        
        img.addEventListener('mouseleave', function() {
            img.src = originalSrc;
        });
    });
    
    const cartImages = document.querySelectorAll('.cart img');
    cartImages.forEach(function(img) {
        const originalSrc = img.src;
        const activeSrc = originalSrc.replace('cart.png', 'cart2.png');
        
        img.addEventListener('mousedown', function() {
            img.src = activeSrc;
        });
        
        img.addEventListener('mouseup', function() {
            img.src = originalSrc;
        });
        
        img.addEventListener('mouseleave', function() {
            img.src = originalSrc;
        });
    });
    
    const socialIcons = document.querySelectorAll('.social-icon');
    socialIcons.forEach(function(img) {
        const originalSrc = img.src;
        let activeSrc = originalSrc;
        
        if (originalSrc.includes('tg.svg')) {
            activeSrc = originalSrc.replace('tg.svg', 'tg2.png');
        } else if (originalSrc.includes('inst.svg')) {
            activeSrc = originalSrc.replace('inst.svg', 'inst2.png');
        } else if (originalSrc.includes('vk.svg')) {
            activeSrc = originalSrc.replace('vk.svg', 'vk2.png');
        }
        
        img.addEventListener('mousedown', function() {
            img.src = activeSrc;
        });
        
        img.addEventListener('mouseup', function() {
            img.src = originalSrc;
        });
        
        img.addEventListener('mouseleave', function() {
            img.src = originalSrc;
        });
    });
    
    const footerLogo = document.querySelector('.footer-logo-img');
    if (footerLogo) {
        const originalSrc = footerLogo.src;
        const activeSrc = originalSrc.replace('logo.png', 'logo2.png');
        
        footerLogo.addEventListener('mousedown', function() {
            footerLogo.src = activeSrc;
        });
        
        footerLogo.addEventListener('mouseup', function() {
            footerLogo.src = originalSrc;
        });
        
        footerLogo.addEventListener('mouseleave', function() {
            footerLogo.src = originalSrc;
        });
    }
});

function initYandexMap() {
    if (typeof ymaps !== 'undefined') {
        ymaps.ready(function() {
            const map = new ymaps.Map('yandexMap', {
                center: [60.012489, 30.398734],
                zoom: 16,
                controls: ['zoomControl', 'fullscreenControl']
            });

            const placemark = new ymaps.Placemark([60.012489, 30.398734], {
                balloonContent: 'Mouthful Bloom<br>пр-т Ударников, д.29к1'
            }, {
                preset: 'islands#foodIcon'
            });

            map.geoObjects.add(placemark);
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initYandexMap, 1000);
    
    const catalogBtn = document.querySelector('.btn-catalog');
    if (catalogBtn) {
        catalogBtn.addEventListener('click', function() {
            window.location.href = 'catalog.html';
        });
    }
});

function applyResponsiveStyles() {
    const width = window.innerWidth;
    const isCatalogPage = document.getElementById('catalogGrid') !== null;
    
    if (!isCatalogPage) return;
    
    const pinkBg = document.querySelector('.pink-background, .pink-background1');
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    const logo = document.querySelector('.logo img');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('nav a');
    const cart = document.querySelector('.cart img');
    const headerContent = document.querySelector('.header-content');
    
    const catalogHero = document.querySelector('.catalog-hero');
    const catalogHeroContent = document.querySelector('.catalog-hero-content');
    const catalogHeroText = document.querySelector('.catalog-hero-text');
    const catalogHeroTitle = document.querySelector('.catalog-hero-text h1');
    const catalogHeroImage = document.querySelector('.catalog-hero-image');
    const catalogHeroImageImg = document.querySelector('.catalog-hero-image img');
    
    const catalogContent = document.querySelector('.catalog-content');
    const catalogContentLayout = document.querySelector('.catalog-content-layout');
    const catalogLeftColumn = document.querySelector('.catalog-left-column');
    const catalogMiddleColumn = document.querySelector('.catalog-middle-column');
    const catalogRightColumn = document.querySelector('.catalog-right-column');
    const catalogDescription = document.querySelector('.catalog-description');
    const catalogButtons = document.querySelector('.catalog-buttons');
    const catalogBtnCatalog = document.querySelector('.catalog-btn-catalog');
    const catalogBtnAbout = document.querySelector('.catalog-btn-about');
    const catalogImagesRight = document.querySelector('.catalog-images-right');
    
    const catalogPageSection = document.querySelector('.catalog-page-section');
    const catalogPageHeader = document.querySelector('.catalog-page-header');
    const catalogPageTitle = document.querySelector('.catalog-page-title');
    const catalogPageControls = document.querySelector('.catalog-page-controls');
    const catalogPageSearchBox = document.querySelector('.catalog-page-search-box');
    const catalogPageSearchInput = document.querySelector('.catalog-page-search-input');
    const catalogPageFilterSelect = document.querySelector('.catalog-page-filter-select');
    const catalogPageGrid = document.querySelector('.catalog-page-grid');
    const catalogPageCards = document.querySelectorAll('.catalog-page-card');
    
    if (width <= 480) {
        if (pinkBg) pinkBg.style.display = 'none';
        
        if (header) header.style.padding = '15px 20px';
        if (headerContent) headerContent.style.gap = '15px';
        if (logo) {
            logo.style.width = '60px';
            logo.style.height = '60px';
        }
        if (nav) {
            nav.style.padding = '8px 20px';
            nav.style.gap = '15px';
        }
        navLinks.forEach(link => {
            link.style.fontSize = '14px';
        });
        if (cart) {
            cart.style.width = '50px';
            cart.style.height = '50px';
        }
        
        if (main) main.style.padding = '0 10px';
        
        if (catalogHero) catalogHero.style.marginBottom = '30px';
        if (catalogHeroContent) {
            catalogHeroContent.style.flexDirection = 'column';
            catalogHeroContent.style.padding = '0';
            catalogHeroContent.style.gap = '20px';
            catalogHeroContent.style.alignItems = 'center';
        }
        if (catalogHeroText) {
            catalogHeroText.style.minWidth = 'auto';
            catalogHeroText.style.width = '100%';
            catalogHeroText.style.textAlign = 'center';
        }
        if (catalogHeroTitle) {
            catalogHeroTitle.style.fontSize = '32px';
            catalogHeroTitle.style.marginTop = '0';
        }
        if (catalogHeroImage) {
            catalogHeroImage.style.marginLeft = '0';
            catalogHeroImage.style.marginTop = '0';
            catalogHeroImage.style.width = '100%';
            const heroImg = catalogHeroImage.querySelector('img');
            if (heroImg) {
                heroImg.style.width = '100%';
                heroImg.style.height = 'auto';
            }
        }
        
        if (catalogContent) {
            catalogContent.style.marginTop = '30px';
            catalogContent.style.marginLeft = '0';
        }
        if (catalogContentLayout) {
            catalogContentLayout.style.flexDirection = 'column';
            catalogContentLayout.style.padding = '0';
            catalogContentLayout.style.gap = '20px';
            catalogContentLayout.style.alignItems = 'center';
            catalogContentLayout.style.marginLeft = '-1px';
        }
        if (catalogLeftColumn) catalogLeftColumn.style.display = 'none';
        if (catalogMiddleColumn) {
            catalogMiddleColumn.style.maxWidth = '100%';
            catalogMiddleColumn.style.marginTop = '0';
            catalogMiddleColumn.style.alignItems = 'center';
            catalogMiddleColumn.style.textAlign = 'center';
            catalogMiddleColumn.style.width = '100%';
        }
        if (catalogDescription) {
            catalogDescription.style.width = '100%';
            catalogDescription.style.fontSize = '14px';
            catalogDescription.style.padding = '15px';
            catalogDescription.style.textAlign = 'center';
            catalogDescription.style.boxSizing = 'border-box';
        }
        if (catalogButtons) {
            catalogButtons.style.marginTop = '15px';
            catalogButtons.style.width = '100%';
            catalogButtons.style.alignItems = 'center';
        }
        if (catalogBtnCatalog) {
            catalogBtnCatalog.style.width = '100%';
            catalogBtnCatalog.style.height = '50px';
            catalogBtnCatalog.style.fontSize = '16px';
        }
        if (catalogBtnAbout) {
            catalogBtnAbout.style.width = '100%';
            catalogBtnAbout.style.height = '50px';
            catalogBtnAbout.style.fontSize = '16px';
        }
        if (catalogRightColumn) {
            catalogRightColumn.style.marginLeft = '0';
            catalogRightColumn.style.marginTop = '0';
            catalogRightColumn.style.width = '100%';
        }
        if (catalogImagesRight) {
            catalogImagesRight.style.marginTop = '0';
            catalogImagesRight.style.width = '100%';
            catalogImagesRight.style.display = 'flex';
            catalogImagesRight.style.justifyContent = 'center';
            const rightImg = catalogImagesRight.querySelector('img');
            if (rightImg) {
                rightImg.style.width = '100%';
                rightImg.style.height = 'auto';
            }
        }
        
        if (catalogPageSection) {
            catalogPageSection.style.padding = '0 10px';
            catalogPageSection.style.marginTop = '40px';
        }
        if (catalogPageHeader) {
            catalogPageHeader.style.flexDirection = 'column';
            catalogPageHeader.style.alignItems = 'center';
        }
        if (catalogPageTitle) {
            catalogPageTitle.style.fontSize = '32px';
            catalogPageTitle.style.textAlign = 'center';
            catalogPageTitle.style.width = '100%';
        }
        if (catalogPageControls) {
            catalogPageControls.style.width = '100%';
            catalogPageControls.style.flexDirection = 'column';
            catalogPageControls.style.marginLeft = '0';
            catalogPageControls.style.alignItems = 'center';
        }
        if (catalogPageSearchBox) catalogPageSearchBox.style.width = '100%';
        if (catalogPageSearchInput) {
            catalogPageSearchInput.style.fontSize = '14px';
            catalogPageSearchInput.style.padding = '10px 35px 10px 14px';
        }
        if (catalogPageFilterSelect) {
            catalogPageFilterSelect.style.width = '100%';
            catalogPageFilterSelect.style.fontSize = '14px';
            catalogPageFilterSelect.style.padding = '10px 16px';
        }
        if (catalogPageGrid) {
            catalogPageGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            catalogPageGrid.style.gap = '12px 8px';
        }
        catalogPageCards.forEach(card => {
            card.style.padding = '8px';
            card.style.height = 'auto';
            
            const cardImage = card.querySelector('.catalog-page-card-image');
            if (cardImage) {
                cardImage.style.height = '110px';
                cardImage.style.marginBottom = '8px';
            }
            
            const cardTitle = card.querySelector('.catalog-page-card-title');
            if (cardTitle) {
                cardTitle.style.fontSize = '14px';
                cardTitle.style.marginBottom = '4px';
            }
            
            const cardArticle = card.querySelector('.catalog-page-card-article');
            if (cardArticle) {
                cardArticle.style.fontSize = '10px';
                cardArticle.style.marginBottom = '4px';
            }
            
            const cardPrice = card.querySelector('.catalog-page-card-price');
            if (cardPrice) {
                cardPrice.style.fontSize = '14px';
                cardPrice.style.marginBottom = '8px';
            }
            
            const cardButton = card.querySelector('.catalog-page-card-button');
            if (cardButton) {
                cardButton.style.width = '90%';
                cardButton.style.fontSize = '11px';
                cardButton.style.height = '32px';
            }
        });
    }
    else if (width <= 768) {
        if (pinkBg) pinkBg.style.display = 'none';
        
        if (header) header.style.padding = '20px 40px';
        if (main) main.style.padding = '0 20px';
        
        if (catalogHero) catalogHero.style.marginBottom = '40px';
        if (catalogHeroContent) {
            catalogHeroContent.style.flexDirection = 'column';
            catalogHeroContent.style.padding = '0';
            catalogHeroContent.style.gap = '20px';
        }
        if (catalogHeroText) {
            catalogHeroText.style.minWidth = 'auto';
            catalogHeroText.style.width = '100%';
        }
        if (catalogHeroTitle) {
            catalogHeroTitle.style.fontSize = '48px';
            catalogHeroTitle.style.marginTop = '0';
        }
        if (catalogHeroImage) {
            catalogHeroImage.style.marginLeft = '0';
            catalogHeroImage.style.marginTop = '0';
            catalogHeroImage.style.width = '100%';
            const heroImg = catalogHeroImage.querySelector('img');
            if (heroImg) {
                heroImg.style.width = '100%';
                heroImg.style.height = 'auto';
            }
        }
        
        if (catalogContent) {
            catalogContent.style.marginLeft = '0';
            catalogContent.style.marginTop = '40px';
        }
        if (catalogContentLayout) {
            catalogContentLayout.style.flexDirection = 'column';
            catalogContentLayout.style.padding = '0';
            catalogContentLayout.style.gap = '30px';
        }
        const catalogLeftImg = document.querySelector('.catalog-images-left img');
        if (catalogLeftImg) {
            catalogLeftImg.style.width = '100%';
            catalogLeftImg.style.height = 'auto';
        }
        if (catalogMiddleColumn) {
            catalogMiddleColumn.style.maxWidth = '100%';
            catalogMiddleColumn.style.marginTop = '0';
        }
        if (catalogDescription) {
            catalogDescription.style.width = '100%';
            catalogDescription.style.fontSize = '16px';
        }
        if (catalogButtons) {
            catalogButtons.style.marginTop = '20px';
            catalogButtons.style.width = '100%';
        }
        if (catalogBtnCatalog) catalogBtnCatalog.style.width = '100%';
        if (catalogBtnAbout) catalogBtnAbout.style.width = '100%';
        if (catalogRightColumn) {
            catalogRightColumn.style.marginLeft = '0';
            catalogRightColumn.style.marginTop = '0';
        }
        if (catalogImagesRight) catalogImagesRight.style.marginTop = '0';
        const catalogRightImg = document.querySelector('.catalog-images-right img');
        if (catalogRightImg) {
            catalogRightImg.style.width = '100%';
            catalogRightImg.style.height = 'auto';
        }
        
        if (catalogPageSection) {
            catalogPageSection.style.padding = '0 40px';
            catalogPageSection.style.marginTop = '60px';
        }
        if (catalogPageHeader) {
            catalogPageHeader.style.flexDirection = 'column';
            catalogPageHeader.style.alignItems = 'flex-start';
        }
        if (catalogPageControls) {
            catalogPageControls.style.width = '100%';
            catalogPageControls.style.flexDirection = 'column';
            catalogPageControls.style.marginLeft = '0';
        }
        if (catalogPageSearchBox) catalogPageSearchBox.style.width = '100%';
        if (catalogPageFilterSelect) catalogPageFilterSelect.style.width = '100%';
        if (catalogPageGrid) {
            catalogPageGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            catalogPageGrid.style.gap = '30px';
        }
    }
    else {
        if (pinkBg) pinkBg.style.display = '';
        if (header) header.style.padding = '';
        if (headerContent) headerContent.style.gap = '';
        if (logo) {
            logo.style.width = '';
            logo.style.height = '';
        }
        if (nav) {
            nav.style.padding = '';
            nav.style.gap = '';
        }
        navLinks.forEach(link => {
            link.style.fontSize = '';
        });
        if (cart) {
            cart.style.width = '';
            cart.style.height = '';
        }
        if (main) main.style.padding = '';
        
        if (catalogHero) catalogHero.style.marginBottom = '';
        if (catalogHeroContent) {
            catalogHeroContent.style.flexDirection = '';
            catalogHeroContent.style.padding = '';
            catalogHeroContent.style.gap = '';
            catalogHeroContent.style.alignItems = '';
        }
        if (catalogHeroText) {
            catalogHeroText.style.minWidth = '';
            catalogHeroText.style.width = '';
            catalogHeroText.style.textAlign = '';
        }
        if (catalogHeroTitle) {
            catalogHeroTitle.style.fontSize = '';
            catalogHeroTitle.style.marginTop = '';
        }
        if (catalogHeroImage) {
            catalogHeroImage.style.marginLeft = '';
            catalogHeroImage.style.marginTop = '';
            catalogHeroImage.style.width = '';
            const heroImg = catalogHeroImage.querySelector('img');
            if (heroImg) {
                heroImg.style.width = '';
                heroImg.style.height = '';
            }
        }
        
        if (catalogContent) {
            catalogContent.style.marginLeft = '';
            catalogContent.style.marginTop = '';
        }
        if (catalogContentLayout) {
            catalogContentLayout.style.flexDirection = '';
            catalogContentLayout.style.padding = '';
            catalogContentLayout.style.gap = '';
            catalogContentLayout.style.alignItems = '';
        }
        if (catalogLeftColumn) catalogLeftColumn.style.display = '';
        if (catalogMiddleColumn) {
            catalogMiddleColumn.style.maxWidth = '';
            catalogMiddleColumn.style.marginTop = '';
            catalogMiddleColumn.style.alignItems = '';
            catalogMiddleColumn.style.textAlign = '';
        }
        if (catalogDescription) {
            catalogDescription.style.width = '';
            catalogDescription.style.fontSize = '';
            catalogDescription.style.padding = '';
            catalogDescription.style.textAlign = '';
        }
        if (catalogButtons) {
            catalogButtons.style.marginTop = '';
            catalogButtons.style.width = '';
            catalogButtons.style.alignItems = '';
        }
        if (catalogBtnCatalog) {
            catalogBtnCatalog.style.width = '';
            catalogBtnCatalog.style.height = '';
            catalogBtnCatalog.style.fontSize = '';
        }
        if (catalogBtnAbout) {
            catalogBtnAbout.style.width = '';
            catalogBtnAbout.style.height = '';
            catalogBtnAbout.style.fontSize = '';
        }
        if (catalogRightColumn) {
            catalogRightColumn.style.marginLeft = '';
            catalogRightColumn.style.marginTop = '';
            catalogRightColumn.style.width = '';
        }
        if (catalogImagesRight) {
            catalogImagesRight.style.marginTop = '';
            catalogImagesRight.style.width = '';
            catalogImagesRight.style.display = '';
            catalogImagesRight.style.justifyContent = '';
        }
        
        const allImages = document.querySelectorAll('.catalog-images-left img, .catalog-images-right img');
        allImages.forEach(img => {
            img.style.width = '';
            img.style.height = '';
        });
        
        if (catalogPageSection) {
            catalogPageSection.style.padding = '';
            catalogPageSection.style.marginTop = '';
        }
        if (catalogPageHeader) {
            catalogPageHeader.style.flexDirection = '';
            catalogPageHeader.style.alignItems = '';
        }
        if (catalogPageTitle) {
            catalogPageTitle.style.fontSize = '';
            catalogPageTitle.style.textAlign = '';
            catalogPageTitle.style.width = '';
        }
        if (catalogPageControls) {
            catalogPageControls.style.width = '';
            catalogPageControls.style.flexDirection = '';
            catalogPageControls.style.marginLeft = '';
            catalogPageControls.style.alignItems = '';
        }
        if (catalogPageSearchBox) catalogPageSearchBox.style.width = '';
        if (catalogPageSearchInput) {
            catalogPageSearchInput.style.fontSize = '';
            catalogPageSearchInput.style.padding = '';
        }
        if (catalogPageFilterSelect) {
            catalogPageFilterSelect.style.width = '';
            catalogPageFilterSelect.style.fontSize = '';
            catalogPageFilterSelect.style.padding = '';
        }
        if (catalogPageGrid) {
            catalogPageGrid.style.gridTemplateColumns = '';
            catalogPageGrid.style.gap = '';
        }
        catalogPageCards.forEach(card => {
            card.style.padding = '';
            card.style.height = '';
            
            const cardImage = card.querySelector('.catalog-page-card-image');
            if (cardImage) {
                cardImage.style.height = '';
                cardImage.style.marginBottom = '';
            }
            
            const cardTitle = card.querySelector('.catalog-page-card-title');
            if (cardTitle) {
                cardTitle.style.fontSize = '';
                cardTitle.style.marginBottom = '';
            }
            
            const cardArticle = card.querySelector('.catalog-page-card-article');
            if (cardArticle) {
                cardArticle.style.fontSize = '';
                cardArticle.style.marginBottom = '';
            }
            
            const cardPrice = card.querySelector('.catalog-page-card-price');
            if (cardPrice) {
                cardPrice.style.fontSize = '';
                cardPrice.style.marginBottom = '';
            }
            
            const cardButton = card.querySelector('.catalog-page-card-button');
            if (cardButton) {
                cardButton.style.width = '';
                cardButton.style.fontSize = '';
                cardButton.style.height = '';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', applyResponsiveStyles);
window.addEventListener('resize', applyResponsiveStyles);

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const filterSelect = document.getElementById('filterSelect');
    const catalogGrid = document.getElementById('catalogGrid');
    
    if (!searchInput || !filterSelect || !catalogGrid) return;
    
    const cards = Array.from(catalogGrid.querySelectorAll('.catalog-page-card'));
    
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModalBtn = document.getElementById('closeModal');
    
    cards.forEach(function(card) {
        card.addEventListener('click', function(e) {
            if (e.target.classList.contains('catalog-page-card-button')) {
                return;
            }
            
            const title = card.querySelector('.catalog-page-card-title').textContent;
            const article = card.querySelector('.catalog-page-card-article').textContent;
            const price = card.querySelector('.catalog-page-card-price').textContent;
            const imgSrc = card.querySelector('.catalog-page-card-image img').src;
            
            const modalTitle = document.querySelector('.window-card-title-head h2');
            const modalArticle = document.querySelector('.window-card-title h1');
            const modalPrice = document.querySelector('.window-h2');
            const modalImg = document.querySelector('.window-card-img img');
            
            if (modalTitle) modalTitle.textContent = title;
            if (modalArticle) modalArticle.textContent = article;
            if (modalPrice) modalPrice.textContent = price;
            if (modalImg) modalImg.src = imgSrc;
            
            if (modalOverlay) {
                modalOverlay.classList.add('active');
            }
        });
    });
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (modalOverlay) {
                modalOverlay.classList.remove('active');
            }
        });
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
            }
        });
    }
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        cards.forEach(function(card) {
            const name = card.getAttribute('data-name').toLowerCase();
            const article = card.querySelector('.catalog-page-card-article').textContent.toLowerCase();
            
            if (name.includes(searchTerm) || article.includes(searchTerm)) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
        
        applyFilter();
    });
    
    filterSelect.addEventListener('change', function() {
        applyFilter();
    });
    
    function applyFilter() {
        const filterValue = filterSelect.value;
        const visibleCards = cards.filter(card => !card.classList.contains('hidden'));
        
        if (filterValue === 'all') {
            return;
        }
        
        visibleCards.sort(function(a, b) {
            const priceA = parseInt(a.getAttribute('data-price'));
            const priceB = parseInt(b.getAttribute('data-price'));
            const nameA = a.getAttribute('data-name').toLowerCase();
            const nameB = b.getAttribute('data-name').toLowerCase();
            
            switch(filterValue) {
                case 'price-asc':
                    return priceA - priceB;
                case 'price-desc':
                    return priceB - priceA;
                case 'name-asc':
                    return nameA.localeCompare(nameB);
                case 'name-desc':
                    return nameB.localeCompare(nameA);
                default:
                    return 0;
            }
        });
        
        visibleCards.forEach(function(card) {
            catalogGrid.appendChild(card);
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {

    const mainOrderButtons = document.querySelectorAll('.catalog-card-button');
    mainOrderButtons.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'payment.html';
        });
    });

    const catalogOrderButtons = document.querySelectorAll('.catalog-page-card-button');
    catalogOrderButtons.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'payment.html';
        });
    });
});

function applyPaymentResponsiveStyles() {
    const width = window.innerWidth;
    const isPaymentPage = document.querySelector('.cart-section') !== null;
    if (!isPaymentPage) return;

    const pinkBg = document.querySelector('.pink-background, .pink-background1');
    const header = document.querySelector('header');
    const headerContent = document.querySelector('.header-content');
    const logoImg = document.querySelector('.logo img');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('nav a');
    const cartImg = document.querySelector('.cart img');
    const main = document.querySelector('main');

    const catalogContent = document.querySelector('.catalog-content');
    const catalogHero = document.querySelector('.catalog-hero');
    const catalogHeroContent = document.querySelector('.catalog-hero-content');
    const catalogHeroText = document.querySelector('.catalog-hero-text');
    const catalogHeroTitle = document.querySelector('.catalog-hero-text h1');
    const catalogHeroImage = document.querySelector('.catalog-hero-image');

    const catalogContentLayout = document.querySelector('.catalog-content-layout');
    const catalogLeftColumn = document.querySelector('.catalog-left-column');
    const catalogMiddleColumn = document.querySelector('.catalog-middle-column');
    const catalogDescription = document.querySelector('.catalog-description');

    const cartContainer = document.querySelector('.cart-container');
    const cartTitle = document.querySelector('.cart-title');
    const sections = document.querySelectorAll('.cart-info-section, .cart-pickup-section, .cart-payment-section, .cart-order-section');
    const formRows = document.querySelectorAll('.cart-form-row');
    const inputs = document.querySelectorAll('.cart-input, .cart-textarea, .cart-select');
    const selectEls = document.querySelectorAll('.cart-select');
    const dateInputs = document.querySelectorAll('.cart-date-input');
    const orderTotal = document.querySelector('.cart-order-total');
    const submitBtn = document.querySelector('.cart-submit-btn');
    const datepicker = document.querySelector('.custom-datepicker');

    if (width <= 480) {
        if (pinkBg) pinkBg.style.display = 'none';
        if (header) header.style.padding = '15px 20px';
        if (headerContent) headerContent.style.gap = '15px';
        if (logoImg) { logoImg.style.width = '60px'; logoImg.style.height = '60px'; }
        if (nav) { nav.style.padding = '8px 20px'; nav.style.gap = '15px'; }
        navLinks.forEach(a => a.style.fontSize = '14px');
        if (cartImg) { cartImg.style.width = '50px'; cartImg.style.height = '50px'; }
        if (main) main.style.padding = '0 10px';

        if (catalogContent) { catalogContent.style.marginLeft = '0'; catalogContent.style.left = '0'; catalogContent.style.transform = 'none'; }
        
        if (catalogHero) catalogHero.style.marginBottom = '20px';
        if (catalogHeroContent) { catalogHeroContent.style.display = 'flex'; catalogHeroContent.style.flexDirection = 'column'; catalogHeroContent.style.alignItems = 'center'; catalogHeroContent.style.gap = '16px'; }
        if (catalogHeroText) { catalogHeroText.style.width = '100%'; catalogHeroText.style.textAlign = 'center'; catalogHeroText.style.minWidth = '0'; }
        if (catalogHeroTitle) { catalogHeroTitle.style.fontSize = '28px'; catalogHeroTitle.style.marginTop = '0'; }
        if (catalogHeroImage) { catalogHeroImage.style.display = 'block'; catalogHeroImage.style.margin = '0 auto'; catalogHeroImage.style.marginLeft = '0'; catalogHeroImage.style.zIndex = '1'; }
        const imgElMobile = catalogHeroImage ? catalogHeroImage.querySelector('img') : null;
        if (imgElMobile) { imgElMobile.style.width = '95vw'; imgElMobile.style.maxWidth = '600px'; imgElMobile.style.height = 'auto'; }

        if (catalogContentLayout) { catalogContentLayout.style.flexDirection = 'column'; catalogContentLayout.style.gap = '16px'; }
        if (catalogLeftColumn) catalogLeftColumn.style.display = 'none';
        if (catalogMiddleColumn) { catalogMiddleColumn.style.width = '100%'; catalogMiddleColumn.style.textAlign = 'center'; }
        if (catalogDescription) { catalogDescription.style.width = '100%'; catalogDescription.style.fontSize = '14px'; catalogDescription.style.padding = '15px'; catalogDescription.style.textAlign = 'center'; }

        if (cartContainer) cartContainer.style.padding = '0 10px';
        if (cartTitle) { cartTitle.style.fontSize = '32px'; cartTitle.style.textAlign = 'center'; cartTitle.style.marginBottom = '20px'; }
        sections.forEach(s => { s.style.padding = '16px'; s.style.borderRadius = '16px'; });
        formRows.forEach(fr => { fr.style.flexDirection = 'column'; fr.style.gap = '10px'; });
        inputs.forEach(i => { i.style.fontSize = '14px'; i.style.padding = '12px 14px'; });
        selectEls.forEach(s => { s.style.backgroundPosition = 'right 16px center'; s.style.backgroundSize = '18px'; });
        dateInputs.forEach(d => { d.style.backgroundPosition = 'right 16px center'; d.style.backgroundSize = '18px'; });
        if (orderTotal) { orderTotal.style.flexDirection = 'column'; orderTotal.style.alignItems = 'flex-start'; orderTotal.style.gap = '6px'; orderTotal.style.fontSize = '16px'; }
        if (submitBtn) { submitBtn.style.padding = '16px'; submitBtn.style.fontSize = '16px'; submitBtn.style.borderRadius = '12px'; submitBtn.style.marginTop = '16px'; }
        if (datepicker) { datepicker.style.width = '280px'; }
    }
    else if (width <= 768) {
        if (pinkBg) pinkBg.style.display = 'none';
        if (header) header.style.padding = '20px 40px';
        if (main) main.style.padding = '0 20px';
        if (catalogContent) { catalogContent.style.marginLeft = '0'; catalogContent.style.left = '0'; catalogContent.style.transform = 'none'; }
        if (catalogHero) catalogHero.style.marginBottom = '30px';
        if (catalogHeroContent) { catalogHeroContent.style.display = 'flex'; catalogHeroContent.style.flexDirection = 'column'; catalogHeroContent.style.gap = '20px'; }
        if (catalogHeroText) { catalogHeroText.style.width = '100%'; catalogHeroText.style.textAlign = 'center'; catalogHeroText.style.minWidth = '0'; }
        if (catalogHeroTitle) { catalogHeroTitle.style.fontSize = '36px'; catalogHeroTitle.style.marginTop = '0'; }
        if (catalogHeroImage) { catalogHeroImage.style.display = 'block'; catalogHeroImage.style.margin = '0 auto'; catalogHeroImage.style.marginLeft = '0'; catalogHeroImage.style.zIndex = '1'; }
        const imgElTablet = catalogHeroImage ? catalogHeroImage.querySelector('img') : null;
        if (imgElTablet) { imgElTablet.style.width = '90vw'; imgElTablet.style.maxWidth = '700px'; imgElTablet.style.height = 'auto'; }
        if (catalogContentLayout) { catalogContentLayout.style.flexDirection = 'column'; catalogContentLayout.style.gap = '20px'; }
        if (catalogLeftColumn) catalogLeftColumn.style.display = 'none';
        if (catalogMiddleColumn) { catalogMiddleColumn.style.width = '100%'; catalogMiddleColumn.style.textAlign = 'center'; }
        if (catalogDescription) { catalogDescription.style.width = '100%'; catalogDescription.style.fontSize = '16px'; catalogDescription.style.textAlign = 'center'; }
        if (cartContainer) cartContainer.style.padding = '0 20px';
        if (cartTitle) { cartTitle.style.fontSize = '36px'; cartTitle.style.textAlign = 'center'; cartTitle.style.marginBottom = '30px'; }
        sections.forEach(s => { s.style.padding = '20px'; });
        formRows.forEach(fr => { fr.style.flexDirection = 'column'; fr.style.gap = '12px'; });
        if (orderTotal) { orderTotal.style.flexDirection = 'row'; orderTotal.style.alignItems = 'center'; orderTotal.style.gap = '0'; orderTotal.style.fontSize = '18px'; }
        if (submitBtn) { submitBtn.style.padding = '18px'; submitBtn.style.fontSize = '18px'; submitBtn.style.borderRadius = '15px'; submitBtn.style.marginTop = '20px'; }
        if (datepicker) { datepicker.style.width = '320px'; }
    }
    else {
        if (pinkBg) pinkBg.style.display = '';
        if (header) header.style.padding = '';
        if (headerContent) headerContent.style.gap = '';
        if (logoImg) { logoImg.style.width = ''; logoImg.style.height = ''; }
        if (nav) { nav.style.padding = ''; nav.style.gap = ''; }
        navLinks.forEach(a => a.style.fontSize = '');
        if (cartImg) { cartImg.style.width = ''; cartImg.style.height = ''; }
        if (main) main.style.padding = '';

        if (catalogContent) { catalogContent.style.marginLeft = ''; catalogContent.style.left = ''; catalogContent.style.transform = ''; }
        
        if (catalogHero) catalogHero.style.marginBottom = '';
        if (catalogHeroContent) { catalogHeroContent.style.display = ''; catalogHeroContent.style.flexDirection = ''; catalogHeroContent.style.alignItems = ''; catalogHeroContent.style.gap = ''; }
        if (catalogHeroText) { catalogHeroText.style.width = ''; catalogHeroText.style.textAlign = ''; catalogHeroText.style.minWidth = ''; }
        if (catalogHeroTitle) { catalogHeroTitle.style.fontSize = ''; catalogHeroTitle.style.marginTop = ''; }
        if (catalogHeroImage) { catalogHeroImage.style.display = ''; catalogHeroImage.style.marginLeft = ''; catalogHeroImage.style.zIndex = ''; }
        const imgElDesktop = catalogHeroImage ? catalogHeroImage.querySelector('img') : null;
        if (imgElDesktop) { imgElDesktop.style.width = ''; imgElDesktop.style.maxWidth = ''; imgElDesktop.style.height = ''; }

        if (catalogContentLayout) { catalogContentLayout.style.flexDirection = ''; catalogContentLayout.style.gap = '';  }
        if (catalogLeftColumn) catalogLeftColumn.style.display = '';
        if (catalogMiddleColumn) { catalogMiddleColumn.style.width = ''; catalogMiddleColumn.style.textAlign = ''; }
        if (catalogDescription) { catalogDescription.style.width = ''; catalogDescription.style.fontSize = ''; catalogDescription.style.padding = ''; catalogDescription.style.textAlign = ''; }

        if (cartContainer) cartContainer.style.padding = '';
        if (cartTitle) { cartTitle.style.fontSize = ''; cartTitle.style.textAlign = ''; cartTitle.style.marginBottom = ''; }
        sections.forEach(s => { s.style.padding = ''; s.style.borderRadius = ''; });
        formRows.forEach(fr => { fr.style.flexDirection = ''; fr.style.gap = ''; });
        inputs.forEach(i => { i.style.fontSize = ''; i.style.padding = ''; });
        selectEls.forEach(s => { s.style.backgroundPosition = ''; s.style.backgroundSize = ''; });
        dateInputs.forEach(d => { d.style.backgroundPosition = ''; d.style.backgroundSize = ''; });
        if (orderTotal) { orderTotal.style.flexDirection = ''; orderTotal.style.alignItems = ''; orderTotal.style.gap = ''; orderTotal.style.fontSize = ''; }
        if (submitBtn) { submitBtn.style.padding = ''; submitBtn.style.fontSize = ''; submitBtn.style.borderRadius = ''; submitBtn.style.marginTop = ''; }
        if (datepicker) { datepicker.style.width = ''; }
    }
}

document.addEventListener('DOMContentLoaded', applyPaymentResponsiveStyles);
window.addEventListener('resize', applyPaymentResponsiveStyles);

document.addEventListener('DOMContentLoaded', function() {
    const paymentButton = document.querySelector('.cart-submit-btn');
    const paymentModal = document.getElementById('paymentSuccessModal');
    const orderNumberSpan = document.getElementById('orderNumber');
    const closeModal = document.querySelector('.payment-close');
    const okButton = document.querySelector('.payment-ok');

    if (!paymentButton || !paymentModal || !orderNumberSpan || !closeModal || !okButton) return;

    paymentButton.addEventListener('click', function(e) {
        e.preventDefault();
        const orderNumber = Math.floor(1000000 + Math.random() * 9000000);
        orderNumberSpan.textContent = String(orderNumber);
        paymentModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', function() {
        paymentModal.style.display = 'none';
    });

    okButton.addEventListener('click', function() {
        paymentModal.style.display = 'none';
    });

    window.addEventListener('click', function(e) {
        if (e.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            paymentModal.style.display = 'none';
        }
    });
});
