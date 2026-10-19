      const sidebar = document.getElementById('sidebarMenu');
      const openBtn = document.getElementById('openMenuBtn');
      const closeBtn = document.getElementById('closeMenuBtn');

      openBtn.addEventListener('click', () => sidebar.classList.add('open'));
      closeBtn.addEventListener('click', () => sidebar.classList.remove('open'));