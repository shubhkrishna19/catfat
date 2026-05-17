const customerSelectors = {
  authShell: '[data-auth-shell]',
  authTab: '[data-auth-tab-trigger]',
  authPanel: '[data-auth-panel]',
  recoverToggle: '[data-recover-toggle]',
  recoverPanel: '[data-recover-panel]',
  passwordToggle: '[data-password-toggle]',
  validateForm: '.js-customer-validate',
  validatedInput: '.js-validate-input',
  fieldError: '.js-field-error',
  accountShell: '[data-account-shell]',
  accountLink: '[data-account-link]',
  accountPanel: '[data-account-panel]',
  accountMobileNav: '[data-account-mobile-nav]',
  logoutOpen: '[data-logout-open]',
  logoutModal: '[data-logout-modal]',
  logoutClose: '[data-logout-close]',
  accordionGroup: '[data-accordion-group]',
  customerAddresses: '[data-customer-addresses]',
  addressCountrySelect: '[data-address-country-select]',
  addressContainer: '[data-address]',
  toggleAddressButton: 'button[aria-expanded]',
  cancelAddressButton: 'button[type="reset"]',
  deleteAddressButton: 'button[data-confirm-message]',
};

class CustomerAddresses {
  constructor() {
    const container = document.querySelector(customerSelectors.customerAddresses);
    if (!container) return;

    this.container = container;
    this.toggleButtons = container.querySelectorAll(customerSelectors.toggleAddressButton);
    this.cancelButtons = container.querySelectorAll(customerSelectors.cancelAddressButton);
    this.deleteButtons = container.querySelectorAll(customerSelectors.deleteAddressButton);
    this.countrySelects = container.querySelectorAll(customerSelectors.addressCountrySelect);

    this.setupCountries();
    this.setupEventListeners();
  }

  setupCountries() {
    if (!(window.Shopify && Shopify.CountryProvinceSelector)) return;

    new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
      hideElement: 'AddressProvinceContainerNew',
    });

    this.countrySelects.forEach((select) => {
      const formId = select.dataset.formId;
      new Shopify.CountryProvinceSelector(`AddressCountry_${formId}`, `AddressProvince_${formId}`, {
        hideElement: `AddressProvinceContainer_${formId}`,
      });
    });
  }

  setupEventListeners() {
    this.toggleButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const nextValue = button.getAttribute('aria-expanded') === 'false';
        button.setAttribute('aria-expanded', String(nextValue));
        const controlled = document.getElementById(button.getAttribute('aria-controls'));
        controlled?.classList.toggle('is-visible', nextValue);
      });
    });

    this.cancelButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const container = button.closest(customerSelectors.addressContainer);
        const toggle = container?.querySelector('button[aria-controls]');
        if (!toggle) return;
        toggle.setAttribute('aria-expanded', 'false');
        const controlled = document.getElementById(toggle.getAttribute('aria-controls'));
        controlled?.classList.remove('is-visible');
      });
    });

    this.deleteButtons.forEach((button) => {
      button.addEventListener('click', () => {
        if (!confirm(button.dataset.confirmMessage)) return;
        Shopify.postLink(button.dataset.target, { parameters: { _method: 'delete' } });
      });
    });
  }
}

function setActiveAuthTab(shell, target) {
  shell.querySelectorAll(customerSelectors.authTab).forEach((tab) => {
    const active = tab.dataset.authTabTrigger === target;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  shell.querySelectorAll(customerSelectors.authPanel).forEach((panel) => {
    panel.classList.toggle('is-active', panel.dataset.authPanel === target);
  });
}

function initAuthTabs() {
  document.querySelectorAll(customerSelectors.authShell).forEach((shell) => {
    setActiveAuthTab(shell, shell.dataset.defaultTab || 'login');

    shell.querySelectorAll(customerSelectors.authTab).forEach((tab) => {
      tab.addEventListener('click', () => setActiveAuthTab(shell, tab.dataset.authTabTrigger));
    });

    shell.querySelectorAll(customerSelectors.recoverToggle).forEach((toggle) => {
      toggle.addEventListener('click', (event) => {
        event.preventDefault();
        shell.querySelector(customerSelectors.recoverPanel)?.classList.toggle('is-visible');
      });
    });
  });
}

function initPasswordToggles() {
  document.querySelectorAll(customerSelectors.passwordToggle).forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.getAttribute('aria-controls'));
      if (!input) return;
      const nextType = input.type === 'password' ? 'text' : 'password';
      input.type = nextType;
      button.textContent = nextType === 'password' ? 'Show' : 'Hide';
    });
  });
}

function validateField(input) {
  const error = input.closest('.customer-form__group')?.querySelector(customerSelectors.fieldError);
  if (!error) return input.checkValidity();

  if (input.dataset.matchField) {
    const target = document.getElementById(input.dataset.matchField);
    const matches = target && input.value === target.value;
    input.setCustomValidity(matches ? '' : 'Passwords do not match.');
  }

  if (input.checkValidity()) {
    input.removeAttribute('aria-invalid');
    error.textContent = '';
    return true;
  }

  input.setAttribute('aria-invalid', 'true');
  error.textContent = input.dataset.validationMessage || input.validationMessage;
  return false;
}

function initFormValidation() {
  document.querySelectorAll(customerSelectors.validateForm).forEach((form) => {
    const inputs = form.querySelectorAll(customerSelectors.validatedInput);
    inputs.forEach((input) => {
      input.addEventListener('input', () => validateField(input));
      input.addEventListener('blur', () => validateField(input));
    });

    form.addEventListener('submit', (event) => {
      let firstInvalid;
      inputs.forEach((input) => {
        const valid = validateField(input);
        if (!valid && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) {
        event.preventDefault();
        firstInvalid.focus();
      }
    });
  });
}

function setActiveAccountPanel(shell, target) {
  const available = Array.from(shell.querySelectorAll(customerSelectors.accountPanel)).map((panel) => panel.dataset.accountPanel);
  const nextPanel = available.includes(target) ? target : shell.dataset.defaultPanel || available[0];

  shell.querySelectorAll(customerSelectors.accountPanel).forEach((panel) => {
    panel.classList.toggle('is-active', panel.dataset.accountPanel === nextPanel);
  });

  shell.querySelectorAll(customerSelectors.accountLink).forEach((link) => {
    const active = link.dataset.accountLink === nextPanel && link.getAttribute('href')?.includes('#');
    link.classList.toggle('is-active', active);
  });

  shell.querySelectorAll(customerSelectors.accountMobileNav).forEach((select) => {
    const nextOption = Array.from(select.options).find((option) => option.value.includes(`#${nextPanel}`));
    if (nextOption) select.value = nextOption.value;
  });
}

function initAccountPanels() {
  document.querySelectorAll(customerSelectors.accountShell).forEach((shell) => {
    const applyHash = () => {
      const hash = window.location.hash.replace('#', '');
      setActiveAccountPanel(shell, hash || shell.dataset.defaultPanel || 'profile');
    };

    applyHash();
    window.addEventListener('hashchange', applyHash);

    shell.querySelectorAll(customerSelectors.accountMobileNav).forEach((select) => {
      select.addEventListener('change', () => {
        if (select.value) window.location.href = select.value;
      });
    });
  });
}

function initLogoutModal() {
  const modal = document.querySelector(customerSelectors.logoutModal);
  if (!modal) return;

  const close = () => modal.classList.remove('is-visible');

  document.querySelectorAll(customerSelectors.logoutOpen).forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      modal.classList.add('is-visible');
    });
  });

  modal.querySelectorAll(customerSelectors.logoutClose).forEach((trigger) => {
    trigger.addEventListener('click', close);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
}

function initAccordionGroups() {
  document.querySelectorAll(customerSelectors.accordionGroup).forEach((group) => {
    const items = group.querySelectorAll('details');
    items.forEach((item) => {
      item.addEventListener('toggle', () => {
        if (!item.open) return;
        items.forEach((other) => {
          if (other !== item) other.open = false;
        });
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initAuthTabs();
  initPasswordToggles();
  initFormValidation();
  initAccountPanels();
  initLogoutModal();
  initAccordionGroups();
  new CustomerAddresses();
});
