
// --- app.js ---
// RAGOps Studio - Main Application JavaScript
// Contains: Smooth scrolling, scroll animations, demo simulator, tabs, pricing toggle, FAQ accordion, modal validation, newsletter validation

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initSmoothScrolling();
    initScrollAnimations();
    initNavigationHighlighting();
    initDemoSimulator();
    initTabs();
    initPricingToggle();
    initFAQAccordion();
    initModal();
    initNewsletterForm();
    initChunkSizeSlider();
});

// Smooth Scrolling for Anchor Links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Scroll Reveal Animations with IntersectionObserver
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all feature cards and other elements
    document.querySelectorAll('.feature-card, .scroll-reveal').forEach(el => {
        observer.observe(el);
    });
}

// Active Navigation Highlighting
function initNavigationHighlighting() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.3
    });

    sections.forEach(section => observer.observe(section));
}

// Demo Simulator - RAG Quality Calculator
function initDemoSimulator() {
    const simulateBtn = document.getElementById('simulate-btn');
    if (!simulateBtn) return;

    simulateBtn.addEventListener('click', function() {
        const embedding = document.getElementById('embedding-model').value;
        const chunkSize = parseInt(document.getElementById('chunk-size').value);
        const retriever = document.getElementById('retriever').value;

        // Calculate metrics based on configuration
        const results = calculateRAGMetrics(embedding, chunkSize, retriever);

        // Update chart bars
        updateChartBars(results);

        // Update generated answer
        updateGeneratedAnswer(embedding, retriever, results);
    });
}

function calculateRAGMetrics(embedding, chunkSize, retriever) {
    // Base scores for different configurations
    const embeddingScores = {
        'openai': { retrieval: 85, faithfulness: 82, latency: 150, cost: 0.02 },
        'cohere': { retrieval: 88, faithfulness: 85, latency: 180, cost: 0.015 },
        'local': { retrieval: 75, faithfulness: 70, latency: 300, cost: 0.001 }
    };

    const retrieverScores = {
        'vector': { retrieval: 0, faithfulness: 0, latency: 0, cost: 0 },
        'hybrid': { retrieval: 8, faithfulness: 5, latency: 50, cost: 0.005 },
        'bm25': { retrieval: 5, faithfulness: 3, latency: 30, cost: 0.002 }
    };

    // Chunk size impact (optimal around 512)
    const chunkImpact = Math.abs(chunkSize - 512) / 512;
    const chunkRetrievalPenalty = chunkImpact * 10;
    const chunkLatencyPenalty = chunkImpact * 100;

    const base = embeddingScores[embedding];
    const retrieverAdjust = retrieverScores[retriever];

    return {
        retrieval: Math.max(50, Math.min(95, base.retrieval - chunkRetrievalPenalty + retrieverAdjust.retrieval)),
        faithfulness: Math.max(50, Math.min(95, base.faithfulness + retrieverAdjust.faithfulness)),
        latency: Math.max(50, Math.min(500, base.latency + chunkLatencyPenalty + retrieverAdjust.latency)),
        cost: Math.max(0.001, base.cost + retrieverAdjust.cost)
    };
}

function updateChartBars(results) {
    // Update retrieval score
    const retrievalBar = document.getElementById('bar-retrieval');
    const retrievalValue = document.getElementById('value-retrieval');
    retrievalBar.style.width = `${results.retrieval}%`;
    retrievalValue.textContent = `${results.retrieval.toFixed(1)}%`;

    // Update faithfulness
    const faithfulnessBar = document.getElementById('bar-faithfulness');
    const faithfulnessValue = document.getElementById('value-faithfulness');
    faithfulnessBar.style.width = `${results.faithfulness}%`;
    faithfulnessValue.textContent = `${results.faithfulness.toFixed(1)}%`;

    // Update latency (scale to 100% for display)
    const latencyBar = document.getElementById('bar-latency');
    const latencyValue = document.getElementById('value-latency');
    const latencyPercent = Math.min(100, (results.latency / 500) * 100);
    latencyBar.style.width = `${latencyPercent}%`;
    latencyValue.textContent = `${results.latency.toFixed(0)}ms`;

    // Update cost (scale to 100% for display)
    const costBar = document.getElementById('bar-cost');
    const costValue = document.getElementById('value-cost');
    const costPercent = Math.min(100, (results.cost / 0.05) * 100);
    costBar.style.width = `${costPercent}%`;
    costValue.textContent = `$${results.cost.toFixed(3)}`;
}

function updateGeneratedAnswer(embedding, retriever, results) {
    const answerText = document.getElementById('answer-text');

    const answers = {
        'openai': {
            'vector': "The system retrieved highly relevant context using OpenAI embeddings. The answer demonstrates strong factual accuracy with proper source attribution.",
            'hybrid': "Using hybrid search with OpenAI embeddings, the system combined semantic and keyword matching for comprehensive retrieval. Response shows excellent faithfulness.",
            'bm25': "BM25 retrieval with OpenAI embeddings provides keyword-focused results. Answer is accurate but may lack some semantic understanding."
        },
        'cohere': {
            'vector': "Cohere's multilingual embeddings delivered strong retrieval performance. The generated response maintains high faithfulness to source materials.",
            'hybrid': "Hybrid approach with Cohere embeddings optimizes both semantic relevance and keyword coverage. Results show balanced performance.",
            'bm25': "Traditional BM25 with Cohere embeddings provides reliable keyword matching. Answer quality remains consistent across queries."
        },
        'local': {
            'vector': "Local embeddings provide privacy-focused retrieval. Results show acceptable performance with slightly higher latency due to local processing.",
            'hybrid': "Hybrid search with local models balances privacy and performance. Answer quality is maintained with local inference.",
            'bm25': "BM25 with local embeddings offers cost-effective retrieval. Results are consistent but may lack deep semantic understanding."
        }
    };

    // Add performance note based on scores
    let note = "";
    if (results.retrieval > 85) note += " Excellent retrieval quality. ";
    if (results.faithfulness > 80) note += " High factual accuracy. ";
    if (results.latency < 200) note += " Fast response times. ";
    if (results.cost < 0.01) note += " Cost-effective operation.";

    answerText.textContent = (answers[embedding][retriever] || "Configure settings to see results...") + note;
}

// Chunk Size Slider Update
function initChunkSizeSlider() {
    const chunkSlider = document.getElementById('chunk-size');
    const chunkValue = document.getElementById('chunk-value');

    if (chunkSlider && chunkValue) {
        chunkSlider.addEventListener('input', function() {
            chunkValue.textContent = this.value;
        });
    }
}

// Use Cases Tabs
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Update button states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Update content visibility
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// Pricing Toggle (Monthly/Annual)
function initPricingToggle() {
    const toggle = document.getElementById('pricing-toggle');
    const monthlyLabel = document.getElementById('monthly-label');
    const annualLabel = document.getElementById('annual-label');
    const prices = document.querySelectorAll('.price[data-monthly]');

    if (!toggle) return;

    toggle.addEventListener('click', function() {
        const isAnnual = this.classList.toggle('active');

        // Update labels
        if (isAnnual) {
            monthlyLabel.classList.remove('toggle-active');
            annualLabel.classList.add('toggle-active');
        } else {
            monthlyLabel.classList.add('toggle-active');
            annualLabel.classList.remove('toggle-active');
        }

        // Update prices
        prices.forEach(price => {
            const monthly = price.getAttribute('data-monthly');
            const annual = price.getAttribute('data-annual');
            const value = isAnnual ? annual : monthly;

            if (value === '0') {
                price.innerHTML = '$0<span>/mo</span>';
            } else if (value === 'Custom') {
                price.innerHTML = 'Custom';
            } else {
                price.innerHTML = `$${value}<span>/mo</span>`;
            }
        });
    });
}

// FAQ Accordion
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });
    });
}

// Modal Management
function initModal() {
    const modal = document.getElementById('demo-modal');
    const openButtons = document.querySelectorAll('#demoBtn, #heroDemoBtn, .btn-primary');
    const closeButton = modal.querySelector('.close-modal');
    const demoForm = document.getElementById('demo-form');

    // Open modal
    openButtons.forEach(btn => {
        if (btn.id === 'demoBtn' || btn.id === 'heroDemoBtn' || btn.textContent.includes('Demo') || btn.textContent.includes('Get Pro') || btn.textContent.includes('Contact Sales') || btn.textContent.includes('Start Free')) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                openDemoModal();
            });
        }
    });

    // Close modal
    closeButton.addEventListener('click', closeDemoModal);

    // Close on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeDemoModal();
        }
    });

    // Form submission
    if (demoForm) {
        demoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            validateDemoForm();
        });
    }
}

function openDemoModal() {
    const modal = document.getElementById('demo-modal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeDemoModal() {
    const modal = document.getElementById('demo-modal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';

        // Reset form
        const form = document.getElementById('demo-form');
        const message = document.getElementById('form-message');
        if (form) form.reset();
        if (message) {
            message.className = 'form-message';
            message.textContent = '';
        }
    }
}

function validateDemoForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const company = document.getElementById('company').value.trim();
    const usecase = document.getElementById('usecase').value;
    const message = document.getElementById('form-message');

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !company) {
        showMessage(message, 'Please fill in all required fields.', 'error');
        return;
    }

    if (!emailRegex.test(email)) {
        showMessage(message, 'Please enter a valid email address.', 'error');
        return;
    }

    // Simulate successful submission
    showMessage(message, 'Request submitted! We\'ll contact you within 24 hours.', 'success');

    setTimeout(() => {
        closeDemoModal();
    }, 2000);
}

// Newsletter Form Validation
function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('newsletter-email').value.trim();
        const message = document.getElementById('newsletter-message');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            showMessage(message, 'Please enter a valid email address.', 'error');
            return;
        }

        // Simulate API call
        showMessage(message, 'Thank you for subscribing! Check your email for confirmation.', 'success');
        form.reset();
    });
}

function showMessage(element, text, type) {
    element.textContent = text;
    element.className = `form-message ${type}`;

    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            element.className = 'form-message';
            element.textContent = '';
        }, 3000);
    }
}

// Utility function to check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
