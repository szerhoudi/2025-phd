/**
 * PhD Presentation Custom Animations and Interactions
 * Separated from HTML for better maintainability
 */

class PresentationController {
  constructor() {
    this.animationTimeouts = [];
    this.searchTextInterval = null;
    this.serpInterval = null;
    this.queryTyped = null;
    this.chatQueryTyped = null;

    // User lottie state
    this.isFirstPlay = true;
    this.userLottieInstance = null;
    this.loopStartFrame = 0;
    this.loopEndFrame = 0;

    // User lottie 2 state  
    this.isFirstPlay2 = true;
    this.userLottieInstance2 = null;
    this.loopStartFrame2 = 0;
    this.loopEndFrame2 = 0;

    // User lottie sim state
    this.isFirstPlaySim = true;
    this.userLottieInstanceSim = null;
    this.loopStartFrameSim = 0;
    this.loopEndFrameSim = 0;

    // Simulator lottie state
    this.isFirstPlaySimulator = true;
    this.simulatorLottieInstance = null;
    this.loopStartFrameSimulator = 0;
    this.loopEndFrameSimulator = 0;
    this.simulatorLoopHandler = null;
    this.simulatorLoopTimeout = null;

    // Research questions lottie states
    this.isFirstPlaySimulatorRQ = true;
    this.simulatorLottieInstanceRQ = null;
    this.loopStartFrameSimulatorRQ = 0;
    this.loopEndFrameSimulatorRQ = 0;
    this.simulatorLoopHandlerRQ = null;
    this.simulatorLoopTimeoutRQ = null;

    this.isFirstPlayUserRQ = true;
    this.userLottieInstanceRQ = null;
    this.loopStartFrameUserRQ = 0;
    this.loopEndFrameUserRQ = 0;

    this.init();
  }

  async init() {
    await this.loadExternalSlides();
    this.setupRevealHandlers();
    this.setupLottieAnimations();
    this.setupDelayedAnimations();
  }

  async loadExternalSlides() {
    const externalSections = document.querySelectorAll('section[data-external]');

    for (const section of externalSections) {
      const externalPath = section.getAttribute('data-external');
      try {
        const response = await fetch(externalPath);
        if (response.ok) {
          const content = await response.text();
          section.innerHTML = content;
          section.removeAttribute('data-external');
        } else {
          console.error(`Failed to load external slide: ${externalPath}`);
          section.innerHTML = `<h2>Error loading slide: ${externalPath}</h2>`;
        }
      } catch (error) {
        console.error(`Error loading external slide ${externalPath}:`, error);
        section.innerHTML = `<h2>Error loading slide: ${externalPath}</h2>`;
      }
    }

    document.dispatchEvent(new Event('slides-loaded'));
  }

  setupRevealHandlers() {
    // Fragment animations
    Reveal.on("fragmentshown", (event) => {
      this.handleFragmentShown(event);
    });

    // Add fragment hidden handler
    Reveal.on("fragmenthidden", (event) => {
      this.handleFragmentHidden(event);
    });

    // Slide change handler
    Reveal.on('slidechanged', (event) => {
      this.handleSlideChanged(event);
    });

    // Ready handler
    Reveal.on('ready', (event) => {
      this.handleReady(event);
    });
  }

  handleFragmentShown(event) {
    if (event.fragment.id === "query-anim-fragment") {
      this.startQueryTyping();
    } else if (event.fragment.id === "search-results-fragment") {
      this.hideTypingCursor();
    } else if (event.fragment.id === "chat-query-fragment") {
      this.startChatQueryTyping();
    } else if (event.fragment.id === "chat-response-fragment") {
      this.hideChatTypingCursor();
    } else if (event.fragment.id === "simulator-lottie") {
      this.animateToSimulator();
    }
  }

  handleFragmentHidden(event) {
    if (event.fragment.id === "simulator-lottie") {
      this.animateBackToUser();
    }
  }

  handleSlideChanged(event) {
    // Reset ranking animation
    this.resetRankingAnimation();

    // Clear all animations first
    this.clearAnimations();

    // Always reset user lottie if it's not on the current slide, or if we are moving to its slide
    if (event.currentSlide?.id !== 'information-retrieval') {
      if (this.userLottieInstance) {
        this.userLottieInstance.stop();
      }
    }

    // Handle specific slides
    if (event.currentSlide?.id === 'information-retrieval') {
      this.startIRAnimations();
    } else if (event.currentSlide?.id === 'evaluation-challenge') {
      this.resetEvaluationElements();
      this.startEvaluationAnimations();
    } else if (event.currentSlide?.id === 'web-search') {
      this.startWebSearchAnimation();
    } else if (event.currentSlide?.id === 'chatgpt-search') {
      this.startChatGPTSearchAnimation();
    } else if (event.currentSlide?.id === 'user-simulation') {
      this.startUserSimulationAnimations();
    } else if (event.currentSlide?.id === 'research-questions') {
      this.startResearchQuestionsAnimations();
    } else {
      this.resetUserLottie();
    }
  }

  handleReady(event) {
    if (event.currentSlide?.id === 'information-retrieval') {
      this.startIRAnimations();
    } else if (event.currentSlide?.id === 'evaluation-challenge') {
      this.startEvaluationAnimations();
    } else if (event.currentSlide?.id === 'web-search') {
      this.startWebSearchAnimation();
    } else if (event.currentSlide?.id === 'chatgpt-search') {
      this.startChatGPTSearchAnimation();
    } else if (event.currentSlide?.id === 'user-simulation') {
      this.startUserSimulationAnimations();
    } else if (event.currentSlide?.id === 'research-questions') {
      this.startResearchQuestionsAnimations();
    }
  }

  // ChatGPT Query typing animation
  startChatQueryTyping() {
    // Clean up any existing cursors
    const existingCursors = document.querySelectorAll('.typed-cursor');
    existingCursors.forEach(cursor => cursor.remove());

    // Clear the content of the target element
    const chatQueryElement = document.getElementById('chat-query-anim');
    if (chatQueryElement) {
      chatQueryElement.innerHTML = '';
    }

    // Try to destroy existing instance if it exists
    if (this.chatQueryTyped !== null) {
      this.chatQueryTyped.destroy();
    }

    // Create new instance
    this.chatQueryTyped = new Typed("#chat-query-anim", {
      strings: ["best restaurants in town"],
      typeSpeed: 60,
      showCursor: true // ChatGPT style without cursor
    });
  }

  hideChatTypingCursor() {
    if (this.chatQueryTyped) {
      // For ChatGPT, we don't show cursor, so just complete the typing
      this.chatQueryTyped.stop();
    }
  }

  startChatGPTSearchAnimation() {
    this.clearAnimations();
    this.resetChatGPTElements();

    // Start the chat animation sequence
    this.animationTimeouts.push(setTimeout(() => {
      // Trigger the first fragment (query typing)
      const queryFragment = document.getElementById('chat-query-fragment');
      if (queryFragment && !queryFragment.classList.contains('visible')) {
        // Auto-advance to show query
        Reveal.nextFragment();
      }
    }, 1000));

    this.animationTimeouts.push(setTimeout(() => {
      // Trigger the response fragment
      const responseFragment = document.getElementById('chat-response-fragment');
      if (responseFragment && !responseFragment.classList.contains('visible')) {
        // Auto-advance to show response
        Reveal.nextFragment();
      }
    }, 3000));
  }

  resetChatGPTElements() {
    // Reset chat elements
    const chatQueryElement = document.getElementById('chat-query-anim');
    if (chatQueryElement) {
      chatQueryElement.innerHTML = '';
    }

    // Clean up typed instances
    if (this.chatQueryTyped) {
      this.chatQueryTyped.destroy();
      this.chatQueryTyped = null;
    }
  }



  startUserSimulationAnimations() {
    this.clearAnimations();
    this.resetUserSimulationElements();

    // Start user-lottie-sim in loop mode immediately
    this.startUserSimulationLottie();

    const loadingLottieSim = document.getElementById('loading-lottie-sim');
    if (loadingLottieSim) {
      loadingLottieSim.play();
    }

    // Start loading-lottie-2-sim with delay (unique to user-simulation)
    this.animationTimeouts.push(setTimeout(() => {
      const loadingLottie2UserSim = document.getElementById('loading-lottie-2-sim');
      if (loadingLottie2UserSim) {
        loadingLottie2UserSim.play();
      }
    }, 1500)); // 1.5 second delay to differentiate from other sections

    // Start SERP cycling for user-simulation after a delay
    this.animationTimeouts.push(setTimeout(() => {
      this.startUserSimSerpCycling();
    }, 2000)); // Start SERP cycling after 2 seconds
  }

  resetUserSimulationElements() {
    // Reset the user-simulation specific elements
    const userLottieUserSim = document.getElementById('user-lottie-sim');
    const simulatorLottie = document.getElementById('simulator-lottie');
    const loadingLottie2UserSim = document.getElementById('loading-lottie-2-sim');

    // Reset loading-lottie-2-sim in user-simulation
    if (loadingLottie2UserSim) {
      loadingLottie2UserSim.stop();
    }

    // Reset user-lottie-sim to start fresh
    if (userLottieUserSim) {
      userLottieUserSim.style.transform = 'translateY(0)';
      userLottieUserSim.style.opacity = '1';

      if (this.userLottieInstanceSim) {
        this.userLottieInstanceSim.stop();
        this.userLottieInstanceSim.loop = false;
        this.userLottieInstanceSim.goToAndStop(0, true);
        this.isFirstPlaySim = true;
      }
    }

    // Stop simulator loop and reset
    this.stopSimulatorLoop();

    if (simulatorLottie) {
      simulatorLottie.style.opacity = '0';

      if (this.simulatorLottieInstance) {
        this.simulatorLottieInstance.stop();
        this.simulatorLottieInstance.loop = false;
        this.simulatorLottieInstance.goToAndStop(0, true);
        this.isFirstPlaySimulator = true;
      }
    }

    // Reset SERP images for user-simulation
    ['serp-google-sim', 'serp-chatgpt-sim', 'serp-perplexity-sim'].forEach(id => {
      const img = document.getElementById(id);
      if (img) img.style.opacity = '0';
    });
  }

  animateToSimulator() {
    const userLottieUserSim = document.getElementById('user-lottie-sim');
    const simulatorLottie = document.getElementById('simulator-lottie');

    if (!userLottieUserSim || !simulatorLottie) return;

    // Animate user-lottie-sim up and fade out
    userLottieUserSim.style.transform = 'translateY(-50px)';
    userLottieUserSim.style.opacity = '0';

    // After the fade out animation, show and start simulator
    setTimeout(() => {
      simulatorLottie.style.opacity = '1';

      if (this.simulatorLottieInstance) {
        this.simulatorLottieInstance.goToAndStop(0, true);
        this.simulatorLottieInstance.play();
      }
    }, 500); // Half second delay to match transition duration
  }

  animateBackToUser() {
    const userLottieUserSim = document.getElementById('user-lottie-sim');
    const simulatorLottie = document.getElementById('simulator-lottie');

    if (!userLottieUserSim || !simulatorLottie) return;

    // Stop the simulator loop
    this.stopSimulatorLoop();

    // Hide simulator lottie
    simulatorLottie.style.opacity = '0';
    if (this.simulatorLottieInstance) {
      this.simulatorLottieInstance.stop();
      // Reset speed for next time
      this.simulatorLottieInstance.setSpeed(0.9);
      // Reset first play flag
      this.isFirstPlaySimulator = true;
    }

    // Show and reset user-lottie-sim
    setTimeout(() => {
      userLottieUserSim.style.transform = 'translateY(0)';
      userLottieUserSim.style.opacity = '1';

      // Restart user lottie animation
      if (this.userLottieInstanceSim) {
        this.userLottieInstanceSim.goToAndStop(0, true);
        this.userLottieInstanceSim.play();
      }
    }, 100);
  }

  startUserSimulationLottie() {
    const userLottieUserSim = document.getElementById('user-lottie-sim');
    if (!userLottieUserSim || !this.userLottieInstanceSim) return;

    // Start playing from beginning
    this.userLottieInstanceSim.goToAndStop(0, true);
    this.userLottieInstanceSim.play();
  }

  startUserSimSerpCycling() {
    let currentIndex = 0;
    const serpImages = ['serp-google-sim', 'serp-chatgpt-sim', 'serp-perplexity-sim'];

    const showNextSerp = () => {
      // Hide all images
      serpImages.forEach(id => {
        const img = document.getElementById(id);
        if (img) img.style.opacity = '0';
      });

      // Show current image
      const currentImg = document.getElementById(serpImages[currentIndex]);
      if (currentImg) currentImg.style.opacity = '1';

      // Move to next image
      currentIndex = (currentIndex + 1) % serpImages.length;
    };

    // Show first image immediately
    showNextSerp();

    // Cycle every 4 seconds (same as information-retrieval section)
    this.serpInterval = setInterval(showNextSerp, 4000);
  }

  // Query typing animation
  startQueryTyping() {
    // Always manually clean up any existing cursors first
    const existingCursors = document.querySelectorAll('.typed-cursor');
    existingCursors.forEach(cursor => cursor.remove());

    // Clear the content of the target element
    const queryElement = document.getElementById('query-anim');
    if (queryElement) {
      queryElement.innerHTML = '';
    }

    // Try to destroy existing instance if it exists
    if (this.queryTyped !== null) {
      this.queryTyped.destroy();
    }

    // Create new instance
    this.queryTyped = new Typed("#query-anim", {
      strings: ["best ^75 restaurants ^50 in town"],
      typeSpeed: 50,
    });
  }

  hideTypingCursor() {
    if (this.queryTyped) {
      this.queryTyped.cursor.remove();
    }
  }

  // Lottie setup and animations
  setupLottieAnimations() {
    this.setupUserLottie();
    this.setupUserLottie2();
    this.setupUserLottieSim();
    this.setupSimulatorLottie();
    this.setupResearchQuestionsLotties();
  }

  setupResearchQuestionsLotties() {
    this.setupSimulatorLottieRQ();
    this.setupUserLottieRQ();
  }

  setupSimulatorLottieRQ() {
    const simulatorLottieRQ = document.getElementById('simulator-lottie-rq');
    if (!simulatorLottieRQ) return;

    if (simulatorLottieRQ.hasAttribute('data-setup-complete')) {
      return;
    }
    simulatorLottieRQ.setAttribute('data-setup-complete', 'true');

    if (simulatorLottieRQ.getLottie && simulatorLottieRQ.getLottie()) {
      this.initializeSimulatorLottieRQ(simulatorLottieRQ.getLottie());
      return;
    }

    simulatorLottieRQ.addEventListener('ready', () => {
      const lottieInstance = simulatorLottieRQ.getLottie();
      if (lottieInstance) {
        this.initializeSimulatorLottieRQ(lottieInstance);
      }
    });

    let attempts = 0;
    const maxAttempts = 10;
    const checkInterval = setInterval(() => {
      attempts++;
      if (simulatorLottieRQ.getLottie && simulatorLottieRQ.getLottie()) {
        clearInterval(checkInterval);
        this.initializeSimulatorLottieRQ(simulatorLottieRQ.getLottie());
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        simulatorLottieRQ.load();
      }
    }, 500);
  }

  initializeSimulatorLottieRQ(lottieInstance) {
    if (this.simulatorLottieInstanceRQ) return;

    this.simulatorLottieInstanceRQ = lottieInstance;
    const totalFrames = this.simulatorLottieInstanceRQ.totalFrames;
    if (totalFrames <= 0) return;

    this.loopStartFrameSimulatorRQ = Math.max(0, totalFrames - 30);
    this.loopEndFrameSimulatorRQ = totalFrames - 1;

    // Start playing immediately
    this.simulatorLottieInstanceRQ.play();

    this.simulatorLottieInstanceRQ.addEventListener('complete', () => {
      if (this.isFirstPlaySimulatorRQ) {
        this.isFirstPlaySimulatorRQ = false;
        this.simulatorLottieInstanceRQ.setSpeed(0.4);

        // Start the loop cycle with random pauses
        this.startSimulatorLoopRQ();
      }
    });
  }

  startSimulatorLoopRQ() {
    if (!this.simulatorLottieInstanceRQ) return;

    // Create the loop handler function
    this.simulatorLoopHandlerRQ = () => {
      // Generate random pause between 2-6 seconds (2000-6000ms)
      const randomPause = Math.random() * 4000 + 2000;

      this.simulatorLoopTimeoutRQ = setTimeout(() => {
        if (this.simulatorLottieInstanceRQ) {
          // Play the loop segment again
          this.simulatorLottieInstanceRQ.playSegments([this.loopStartFrameSimulatorRQ, this.loopEndFrameSimulatorRQ], false);
        }
      }, randomPause);
    };

    // Play the loop segment once
    this.simulatorLottieInstanceRQ.playSegments([this.loopStartFrameSimulatorRQ, this.loopEndFrameSimulatorRQ], false);

    // Add the loop handler
    this.simulatorLottieInstanceRQ.addEventListener('complete', this.simulatorLoopHandlerRQ);
  }

  stopSimulatorLoopRQ() {
    // Clear any pending timeout
    if (this.simulatorLoopTimeoutRQ) {
      clearTimeout(this.simulatorLoopTimeoutRQ);
      this.simulatorLoopTimeoutRQ = null;
    }

    // Remove the specific loop handler
    if (this.simulatorLottieInstanceRQ && this.simulatorLoopHandlerRQ) {
      this.simulatorLottieInstanceRQ.removeEventListener('complete', this.simulatorLoopHandlerRQ);
      this.simulatorLoopHandlerRQ = null;
    }
  }

  setupUserLottieRQ() {
    const userLottieRQ = document.getElementById('user-lottie-sim-rq');
    if (!userLottieRQ) return;

    if (userLottieRQ.hasAttribute('data-setup-complete')) {
      return;
    }
    userLottieRQ.setAttribute('data-setup-complete', 'true');

    if (userLottieRQ.getLottie && userLottieRQ.getLottie()) {
      this.initializeUserLottieRQ(userLottieRQ.getLottie());
      return;
    }

    userLottieRQ.addEventListener('ready', () => {
      const lottieInstance = userLottieRQ.getLottie();
      if (lottieInstance) {
        this.initializeUserLottieRQ(lottieInstance);
      }
    });

    let attempts = 0;
    const maxAttempts = 10;
    const checkInterval = setInterval(() => {
      attempts++;
      if (userLottieRQ.getLottie && userLottieRQ.getLottie()) {
        clearInterval(checkInterval);
        this.initializeUserLottieRQ(userLottieRQ.getLottie());
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        userLottieRQ.load();
      }
    }, 500);
  }

  initializeUserLottieRQ(lottieInstance) {
    if (this.userLottieInstanceRQ) return;

    this.userLottieInstanceRQ = lottieInstance;
    const totalFrames = this.userLottieInstanceRQ.totalFrames;
    if (totalFrames <= 0) return;

    this.loopStartFrameUserRQ = Math.max(0, totalFrames - 30);
    this.loopEndFrameUserRQ = totalFrames - 1;

    // Start playing immediately
    this.userLottieInstanceRQ.play();

    this.userLottieInstanceRQ.addEventListener('complete', () => {
      if (this.isFirstPlayUserRQ) {
        this.isFirstPlayUserRQ = false;
        this.userLottieInstanceRQ.playSegments([this.loopStartFrameUserRQ, this.loopEndFrameUserRQ], true);
        this.userLottieInstanceRQ.loop = true;
      }
    });
  }

  startResearchQuestionsAnimations() {
    this.clearAnimations();

    // Start both lottie animations
    if (this.simulatorLottieInstanceRQ) {
      this.simulatorLottieInstanceRQ.goToAndStop(0, true);
      this.simulatorLottieInstanceRQ.play();
    }

    if (this.userLottieInstanceRQ) {
      this.userLottieInstanceRQ.goToAndStop(0, true);
      this.userLottieInstanceRQ.play();
    }
  }

  setupSimulatorLottie() {
    const simulatorLottie = document.getElementById('simulator-lottie');
    if (!simulatorLottie) return;

    // Prevent multiple setups
    if (simulatorLottie.hasAttribute('data-setup-complete')) {
      return;
    }
    simulatorLottie.setAttribute('data-setup-complete', 'true');

    // Check if lottie is already loaded
    if (simulatorLottie.getLottie && simulatorLottie.getLottie()) {
      this.initializeSimulatorLottie(simulatorLottie.getLottie());
      return;
    }

    simulatorLottie.addEventListener('ready', () => {
      const lottieInstance = simulatorLottie.getLottie();
      if (lottieInstance) {
        this.initializeSimulatorLottie(lottieInstance);
      }
    });

    // Fallback initialization
    let attempts = 0;
    const maxAttempts = 10;
    const checkInterval = setInterval(() => {
      attempts++;

      if (simulatorLottie.getLottie && simulatorLottie.getLottie()) {
        clearInterval(checkInterval);
        this.initializeSimulatorLottie(simulatorLottie.getLottie());
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        simulatorLottie.load();
      }
    }, 500);
  }

  initializeSimulatorLottie(lottieInstance) {
    if (this.simulatorLottieInstance) return;

    this.simulatorLottieInstance = lottieInstance;

    const totalFrames = this.simulatorLottieInstance.totalFrames;
    if (totalFrames <= 0) return;

    this.loopStartFrameSimulator = Math.max(0, totalFrames - 30);
    this.loopEndFrameSimulator = totalFrames - 1;

    // Don't autoplay - wait for fragment trigger
    this.simulatorLottieInstance.addEventListener('complete', () => {
      if (this.isFirstPlaySimulator) {
        this.isFirstPlaySimulator = false;

        // Reduce speed for looping
        this.simulatorLottieInstance.setSpeed(0.4);

        // Start the loop cycle with random pauses
        this.startSimulatorLoop();
      }
    });
  }

  startSimulatorLoop() {
    if (!this.simulatorLottieInstance) return;

    // Create the loop handler function
    this.simulatorLoopHandler = () => {
      // Generate random pause between 2-5 seconds (2000-5000ms)
      const randomPause = Math.random() * 3000 + 2000;

      this.simulatorLoopTimeout = setTimeout(() => {
        if (this.simulatorLottieInstance) {
          // Play the loop segment again
          this.simulatorLottieInstance.playSegments([this.loopStartFrameSimulator, this.loopEndFrameSimulator], false);
        }
      }, randomPause);
    };

    // Play the loop segment once
    this.simulatorLottieInstance.playSegments([this.loopStartFrameSimulator, this.loopEndFrameSimulator], false);

    // Add the loop handler
    this.simulatorLottieInstance.addEventListener('complete', this.simulatorLoopHandler);
  }

  stopSimulatorLoop() {
    // Clear any pending timeout
    if (this.simulatorLoopTimeout) {
      clearTimeout(this.simulatorLoopTimeout);
      this.simulatorLoopTimeout = null;
    }

    // Remove the specific loop handler
    if (this.simulatorLottieInstance && this.simulatorLoopHandler) {
      this.simulatorLottieInstance.removeEventListener('complete', this.simulatorLoopHandler);
      this.simulatorLoopHandler = null;
    }
  }

  setupUserLottie() {
    const userLottie = document.getElementById('user-lottie');
    if (!userLottie) return;

    // Prevent multiple setups
    if (userLottie.hasAttribute('data-setup-complete')) {
      return;
    }
    userLottie.setAttribute('data-setup-complete', 'true');

    // Check if lottie is already loaded
    if (userLottie.getLottie && userLottie.getLottie()) {
      this.initializeUserLottie(userLottie.getLottie());
      return;
    }

    userLottie.addEventListener('ready', () => {
      const lottieInstance = userLottie.getLottie();
      if (lottieInstance) {
        this.initializeUserLottie(lottieInstance);
      }
    });

    // Fallback initialization
    let attempts = 0;
    const maxAttempts = 10;
    const checkInterval = setInterval(() => {
      attempts++;

      if (userLottie.getLottie && userLottie.getLottie()) {
        clearInterval(checkInterval);
        this.initializeUserLottie(userLottie.getLottie());
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        userLottie.load();
      }
    }, 500);
  }

  initializeUserLottie(lottieInstance) {
    if (this.userLottieInstance) return;

    this.userLottieInstance = lottieInstance;

    const totalFrames = this.userLottieInstance.totalFrames;
    if (totalFrames <= 0) return;

    this.loopStartFrame = Math.max(0, totalFrames - 30);
    this.loopEndFrame = totalFrames - 1;

    // this.userLottieInstance.play();

    this.userLottieInstance.addEventListener('complete', () => {
      if (this.isFirstPlay) {
        this.isFirstPlay = false;
        this.userLottieInstance.playSegments([this.loopStartFrame, this.loopEndFrame], true);
        this.userLottieInstance.loop = true;
      }
    });

    // If the lottie is ready and we are on the right slide, play it.
    // This handles the initial load. Subsequent loads are handled by `resetUserLottie`.
    const currentSlide = Reveal.getCurrentSlide();
    if (currentSlide && currentSlide.id === 'information-retrieval') {
      this.userLottieInstance.play();
    }
  }

  setupUserLottieSim() {
    const userLottieSim = document.getElementById('user-lottie-sim');
    if (!userLottieSim) return;

    // Prevent multiple setups
    if (userLottieSim.hasAttribute('data-setup-complete')) {
      return;
    }
    userLottieSim.setAttribute('data-setup-complete', 'true');

    // Check if lottie is already loaded
    if (userLottieSim.getLottie && userLottieSim.getLottie()) {
      this.initializeUserLottieSim(userLottieSim.getLottie());
      return;
    }

    userLottieSim.addEventListener('ready', () => {
      const lottieInstanceSim = userLottieSim.getLottie();
      if (lottieInstanceSim) {
        this.initializeUserLottieSim(lottieInstanceSim);
      }
    });

    // Fallback initialization
    let attempts = 0;
    const maxAttempts = 10;
    const checkInterval = setInterval(() => {
      attempts++;

      if (userLottieSim.getLottie && userLottieSim.getLottie()) {
        clearInterval(checkInterval);
        this.initializeUserLottieSim(userLottieSim.getLottie());
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        userLottieSim.load();
      }
    }, 500);
  }

  initializeUserLottieSim(lottieInstanceSim) {
    if (this.userLottieInstanceSim) return;

    this.userLottieInstanceSim = lottieInstanceSim;

    const totalFramesSim = this.userLottieInstanceSim.totalFrames;
    if (totalFramesSim <= 0) return;

    this.loopStartFrameSim = Math.max(0, totalFramesSim - 30);
    this.loopEndFrameSim = totalFramesSim - 1;
  }

  setupUserLottie2() {
    const userLottie2 = document.getElementById('user-lottie-2');
    if (!userLottie2) return;

    // Prevent multiple setups
    if (userLottie2.hasAttribute('data-setup-complete')) {
      return;
    }
    userLottie2.setAttribute('data-setup-complete', 'true');

    // Check if lottie is already loaded
    if (userLottie2.getLottie && userLottie2.getLottie()) {
      this.initializeUserLottie2(userLottie2.getLottie());
      return;
    }

    userLottie2.addEventListener('ready', () => {
      const lottieInstance2 = userLottie2.getLottie();
      if (lottieInstance2) {
        this.initializeUserLottie2(lottieInstance2);
      }
    });

    // Fallback initialization
    let attempts = 0;
    const maxAttempts = 10;
    const checkInterval = setInterval(() => {
      attempts++;

      if (userLottie2.getLottie && userLottie2.getLottie()) {
        clearInterval(checkInterval);
        this.initializeUserLottie2(userLottie2.getLottie());
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        userLottie2.load();
      }
    }, 500);
  }

  setupDelayedAnimations() {
    // Delay the second loading animation
    setTimeout(() => {
      const loadingLottie2 = document.getElementById('loading-lottie-2');
      if (loadingLottie2) {
        loadingLottie2.play();
      }
    }, 2000);

    // Start loading-lottie-4 when needed
    setTimeout(() => {
      const loadingLottie4 = document.getElementById('loading-lottie-4');
      if (loadingLottie4) {
        loadingLottie4.play();
      }
    }, 2000);
  }

  // Animation control
  clearAnimations() {
    // Clear all timeouts
    this.animationTimeouts.forEach(timeout => clearTimeout(timeout));
    this.animationTimeouts = [];

    // Clear intervals
    if (this.searchTextInterval) {
      clearInterval(this.searchTextInterval);
      this.searchTextInterval = null;
    }

    if (this.serpInterval) {
      clearInterval(this.serpInterval);
      this.serpInterval = null;
    }

    // Stop simulator loops
    this.stopSimulatorLoop();
    this.stopSimulatorLoopRQ();

    // Reset research questions lottie animations
    this.resetResearchQuestionsAnimations();
  }

  resetResearchQuestionsAnimations() {
    // Reset simulator-lottie-rq
    if (this.simulatorLottieInstanceRQ) {
      this.simulatorLottieInstanceRQ.stop();
      this.simulatorLottieInstanceRQ.goToAndStop(0, true);
      this.isFirstPlaySimulatorRQ = true;
    }

    // Reset user-lottie-sim-rq
    if (this.userLottieInstanceRQ) {
      this.userLottieInstanceRQ.stop();
      this.userLottieInstanceRQ.loop = false;
      this.userLottieInstanceRQ.goToAndStop(0, true);
      this.isFirstPlayUserRQ = true;
    }

    // Reset user-simulation specific lottie animations
    const loadingLottie2UserSim = document.getElementById('loading-lottie-2-sim');
    const loadingLottieUserSim = document.getElementById('loading-lottie-sim');
    const userLottieUserSim = document.getElementById('user-lottie-sim');
    const simulatorLottie = document.getElementById('simulator-lottie');

    if (loadingLottie2UserSim) {
      loadingLottie2UserSim.stop();
    }

    if (loadingLottieUserSim) {
      loadingLottieUserSim.stop();
    }

    // Reset user-lottie-sim
    if (userLottieUserSim && this.userLottieInstanceSim) {
      userLottieUserSim.style.transform = 'translateY(0)';
      userLottieUserSim.style.opacity = '1';
      this.userLottieInstanceSim.stop();
      this.userLottieInstanceSim.loop = false;
      this.userLottieInstanceSim.goToAndStop(0, true);
      this.isFirstPlaySim = true;
    }

    // Reset simulator lottie
    if (simulatorLottie && this.simulatorLottieInstance) {
      simulatorLottie.style.opacity = '0';
      this.simulatorLottieInstance.stop();
      this.simulatorLottieInstance.loop = false;
      this.simulatorLottieInstance.goToAndStop(0, true);
      this.isFirstPlaySimulator = true;
    }
  }

  // Slide-specific animations
  resetRankingAnimation() {
    const rankingText = document.getElementById('ranking-text');
    if (rankingText) {
      rankingText.classList.remove('slide-up-fade-in-active');
      rankingText.classList.add('slide-up-fade-in-initial');
    }
  }

  startWebSearchAnimation() {
    setTimeout(() => {
      const rankingText = document.getElementById('ranking-text');
      if (rankingText) {
        rankingText.classList.remove('slide-up-fade-in-initial');
        rankingText.classList.add('slide-up-fade-in-active');
      }
    }, 1000);
  }

  resetIRElements() {
    const elements = {
      searchBarContainer: document.getElementById('search-bar-container'),
      thinkingImg: document.getElementById('user-thinking-img'),
      queryText: document.getElementById('query-text'),
      resultText: document.getElementById('result-text'),
      searchText: document.getElementById('search-text'),
      googleSerp: document.getElementById('google-serp')
    };

    // Reset visibility
    if (elements.searchBarContainer) elements.searchBarContainer.style.opacity = '0';
    if (elements.thinkingImg) elements.thinkingImg.style.opacity = '0';
    if (elements.queryText) elements.queryText.style.opacity = '0';
    if (elements.resultText) elements.resultText.style.opacity = '0';
    if (elements.googleSerp) elements.googleSerp.style.opacity = '0';

    if (elements.searchText) {
      elements.searchText.style.opacity = '1';
      elements.searchText.textContent = 'best excuse for deadline';
    }

    // Reset SERP images
    ['serp-google', 'serp-chatgpt', 'serp-perplexity'].forEach(id => {
      const img = document.getElementById(id);
      if (img) img.style.opacity = '0';
    });

    this.resetUserLottie();
  }

  resetUserLottie() {
    if (this.userLottieInstance) {
      this.userLottieInstance.stop();
      this.userLottieInstance.loop = false;
      this.userLottieInstance.stop(); 
      this.userLottieInstance.goToAndPlay(0, true);
    }
  }

  startSerpCycling() {
    let currentIndex = 0;
    const serpImages = ['serp-google', 'serp-chatgpt', 'serp-perplexity'];

    const showNextSerp = () => {
      // Hide all images
      serpImages.forEach(id => {
        const img = document.getElementById(id);
        if (img) img.style.opacity = '0';
      });

      // Show current image
      const currentImg = document.getElementById(serpImages[currentIndex]);
      if (currentImg) currentImg.style.opacity = '1';

      // Move to next image
      currentIndex = (currentIndex + 1) % serpImages.length;
    };

    // Show first image immediately
    showNextSerp();

    // Cycle every 5 seconds
    this.serpInterval = setInterval(showNextSerp, 4000);
  }

  startIRAnimations() {
    this.clearAnimations();
    this.resetIRElements();

    // Fade in search bar and thinking image after 4 seconds
    this.animationTimeouts.push(setTimeout(() => {
      const searchBarContainer = document.getElementById('search-bar-container');
      const thinkingImg = document.getElementById('user-thinking-img');

      if (searchBarContainer) searchBarContainer.style.opacity = '1';
      if (thinkingImg) thinkingImg.style.opacity = '1';
    }, 3000));

    // Show "Query" text after 6 seconds total
    this.animationTimeouts.push(setTimeout(() => {
      const queryText = document.getElementById('query-text');
      if (queryText) queryText.style.opacity = '1';
    }, 5000));

    // Show "Result" text after 8 seconds total
    this.animationTimeouts.push(setTimeout(() => {
      const resultText = document.getElementById('result-text');
      const googleSerp = document.getElementById('google-serp');

      if (resultText) resultText.style.opacity = '1';
      if (googleSerp) {
        googleSerp.style.opacity = '1';
        this.startSerpCycling();
      }
    }, 7000));

    // Start cycling search text after 10 seconds
    this.animationTimeouts.push(setTimeout(() => {
      this.startSearchTextCycling();
    }, 9000));
  }

  startSearchTextCycling() {
    const searchExamples = [
      "how to look busy at work",
      "coffee vs productivity",
      "is napping exercise?"
    ];

    let currentIndex = 0;
    const searchTextElement = document.getElementById('search-text');

    const cycleSearchText = () => {
      searchTextElement.style.opacity = '0';

      setTimeout(() => {
        currentIndex = (currentIndex + 1) % searchExamples.length;
        searchTextElement.textContent = searchExamples[currentIndex];
        searchTextElement.style.opacity = '1';
      }, 500);
    };

    this.searchTextInterval = setInterval(cycleSearchText, 4000);
  }

  initializeUserLottie2(lottieInstance2) {
    if (this.userLottieInstance2) return;

    this.userLottieInstance2 = lottieInstance2;

    const totalFrames2 = this.userLottieInstance2.totalFrames;
    if (totalFrames2 <= 0) return;

    this.loopStartFrame2 = Math.max(0, totalFrames2 - 30);
    this.loopEndFrame2 = totalFrames2 - 1;

    this.userLottieInstance2.play();

    this.userLottieInstance2.addEventListener('complete', () => {
      if (this.isFirstPlay2) {
        this.isFirstPlay2 = false;
        this.userLottieInstance2.playSegments([this.loopStartFrame2, this.loopEndFrame2], true);
        this.userLottieInstance2.loop = true;
      }
    });
  }

  // Evaluation challenge animations
  resetEvaluationElements() {
    // Hide the animation elements by removing the animate class
    const container = document.querySelector('.evaluation-animation-elements');
    if (container) {
      container.classList.remove('animate');
    }

    // Reset user-lottie-2 using the same pattern as user-lottie
    if (this.userLottieInstance2) {
      this.userLottieInstance2.stop();
      this.userLottieInstance2.loop = false;
      this.userLottieInstance2.goToAndPlay(0, true);
    }
  }

  startEvaluationAnimations() {
    this.clearAnimations();
    this.resetEvaluationElements();

    // Trigger the animation sequence
    this.animationTimeouts.push(setTimeout(() => {
      // Re-check that we are on the correct slide before animating
      const currentSlide = Reveal.getCurrentSlide();
      if (currentSlide && currentSlide.id === 'evaluation-challenge') {
        this.runEvaluationAnimationSequence();
      }
    }, 1000));
  }

  runEvaluationAnimationSequence() {
    const elements = {
      container: document.querySelector('.evaluation-animation-elements'),
      resultUp: document.getElementById('evaluation-result-up'),
      resultDown: document.getElementById('evaluation-result-down'),
      textUp: document.getElementById('evaluation-result-text-up'),
      textDown: document.getElementById('evaluation-result-text-down'),
      textOriginal: document.getElementById('evaluation-result-text-original'),
      iconUp: document.getElementById('evaluation-ir-icon-up'),
      iconDown: document.getElementById('evaluation-ir-icon-down'),
      iconB: document.getElementById('evaluation-ir-icon-b'),
      queryText: document.getElementById('evaluation-query-text-original')
    };

    const anchors = {
      result: document.querySelector('[data-id="result-container"]'),
      query: document.querySelector('[data-id="query-container"]'),
      irIcon: document.querySelector('[data-id="ir-icon"]')
    };

    // --- Validate that all elements and anchors exist before proceeding ---
    const allRequired = { ...elements, ...anchors };
    for (const key in allRequired) {
      if (!allRequired[key]) {
        console.error(`Evaluation animation dependency not found: ${key}`);
        return; // Exit if any element is missing
      }
    }

    // The container for our animation elements, which is the slide section
    const container = elements.container.offsetParent;
    if (!container) {
      console.error('Could not find animation container parent.');
      return;
    }

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    // --- Position Lottie Animations and Text ---
    const lottieWidth = (250 / containerWidth) * 100; // Assuming 250px base width
    const lottieHeight = (250 / containerHeight) * 100; // Assuming 250px base height

    // Position result lotties
    const resultLeft = (anchors.result.offsetLeft / containerWidth) * 100;
    const resultTop = (anchors.result.offsetTop / containerHeight) * 100;
    [elements.resultUp, elements.resultDown].forEach(el => {
      el.style.left = `${resultLeft}%`;
      el.style.top = `${resultTop}%`;
      el.style.width = `${lottieWidth}%`;
      el.style.height = `${lottieHeight}%`;
    });
    
    // Position result text labels
    [elements.textUp, elements.textDown, elements.textOriginal].forEach(el => {
      el.style.left = `${resultLeft + (anchors.result.offsetWidth * 0.7 / containerWidth * 100)}%`;
      el.style.top = `${resultTop + (anchors.result.offsetHeight * 0.4 / containerHeight * 100)}%`;
      el.style.transform = 'translate(-50%, -50%)';
    });
    
    // Position query text label
    const queryLeft = (anchors.query.offsetLeft / containerWidth) * 100;
    const queryTop = (anchors.query.offsetTop / containerHeight) * 100;
    elements.queryText.style.left = `${queryLeft + (anchors.query.offsetWidth * 0.3 / containerWidth * 100)}%`;
    elements.queryText.style.top = `${queryTop + (anchors.query.offsetHeight * 0.4 / containerHeight * 100)}%`;
    elements.queryText.style.transform = 'translate(-50%, -50%)';

    // --- Position IR Icons ---
    const iconLeft = (anchors.irIcon.offsetLeft / containerWidth) * 100;
    const iconTop = (anchors.irIcon.offsetTop / containerHeight) * 100;
    const iconWidth = (anchors.irIcon.offsetWidth / containerWidth) * 100;
    const iconHeight = (anchors.irIcon.offsetHeight / containerHeight) * 100;
    [elements.iconUp, elements.iconDown, elements.iconB].forEach(el => {
      el.style.left = `${iconLeft}%`;
      el.style.top = `${iconTop}%`;
      el.style.width = `${iconWidth}%`;
      el.style.height = `${iconHeight}%`;
    });

    // --- Animate ---
    elements.container.classList.add('animate');

    // Set final transform states for animation
    setTimeout(() => {
      // --- Dynamic VH Scaling ---
      // Define the range for screen height and the desired corresponding vh values.
      const minHeight = 400;  // For small screen heights (in px)...
      const maxVh = 14;       // ...we want a large vh gap.

      const maxHeight = 1200; // For large screen heights (in px)...
      const minVh = 9;        // ...we want a smaller vh gap.

      const currentHeight = window.innerHeight;

      // Calculate how far we are into the height range (a value from 0 to 1).
      let progress = (currentHeight - minHeight) / (maxHeight - minHeight);
      
      // Clamp the progress to ensure it doesn't go outside the 0-1 range.
      progress = Math.max(0, Math.min(1, progress));

      // Apply a non-linear "ease-in" curve to the progress.
      // This makes the vh value decrease slowly at first, then more rapidly.
      const exponentialProgress = Math.pow(progress, 2);

      // Calculate the dynamic vh value using the non-linear progress.
      const dynamicVh = maxVh - (exponentialProgress * (maxVh - minVh) * 1.5);

      elements.resultUp.style.transform = `translateY(-${dynamicVh}vh)`;
      elements.textUp.style.transform = `translate(-50%, -50%) translateY(-${dynamicVh}vh)`;
      elements.iconUp.style.transform = `translateY(-${dynamicVh}vh)`;

      elements.resultDown.style.transform = `translateY(${dynamicVh}vh)`;
      elements.textDown.style.transform = `translate(-50%, -50%) translateY(${dynamicVh}vh)`;
      elements.iconDown.style.transform = `translateY(${dynamicVh}vh)`;
    }, 100);
  }

}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PresentationController();
}); 