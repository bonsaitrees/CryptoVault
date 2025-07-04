document.addEventListener('DOMContentLoaded', function() {
  particlesJS('particles-js', {
    particles: {
      number: { value: 100, density: { enable: true, value_area: 800 } },
      color: { value: '#ffffff' },
      shape: { type: 'circle' },
      opacity: { 
        value: 0.4, 
        random: true,
        anim: {
          enable: true,
          speed: 1,
          opacity_min: 0.1,
          sync: false
        }
      },
      size: { 
        value: 3, 
        random: true,
        anim: {
          enable: true,
          speed: 2,
          size_min: 0.1,
          sync: false
        }
      },
      line_linked: { 
        enable: true, 
        distance: 150, 
        color: '#ffffff', 
        opacity: 0.3, 
        width: 1 
      },
      move: { 
        enable: true, 
        speed: 3, 
        direction: 'none', 
        random: true, 
        straight: false, 
        out_mode: 'out', 
        bounce: false,
        attract: {
          enable: true,
          rotateX: 600,
          rotateY: 1200
        }
      }
    },
    interactivity: {
      detect_on: 'canvas',
      events: { 
        onhover: { 
          enable: true, 
          mode: 'grab' 
        }, 
        onclick: { 
          enable: true, 
          mode: 'push' 
        }, 
        resize: true 
      },
      modes: { 
        grab: {
          distance: 140,
          line_linked: {
            opacity: 0.8
          }
        },
        repulse: { 
          distance: 200, 
          duration: 0.4 
        }, 
        push: { 
          particles_nb: 6 
        },
        remove: {
          particles_nb: 2
        }
      }
    },
    retina_detect: true
  });
}); 