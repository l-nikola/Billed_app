/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    beforeEach(() => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.innerHTML = "";
      document.body.appendChild(root);

      router();
      window.onNavigate(ROUTES_PATH.Bills);
    });

    test("Then bill icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      // 1. [Ajout de tests unitaires et d'intégration]
      // Check if the icon is highlighted
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    // 2. [Ajout de tests unitaires et d'intégration]
    // Test that the new bill modal opens
    test("Then I click on the newBill button", () => {
      const newBillButton = screen.getByTestId("btn-new-bill");
      expect(newBillButton).toBeTruthy();
      newBillButton.click();
      const newBillModal = screen.getByTestId("form-new-bill");
      expect(newBillModal).toBeTruthy();
    });

    // Test that the eye icon opens a modal with the bill
    test("Then I click on the eye icon, a modal should open", async () => {
      new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      // Mock de la méthode .modal() de Bootstrap pour éviter une erreur en test
      $.fn.modal = jest.fn();

      const eyeIcons = screen.getAllByTestId("icon-eye");
      userEvent.click(eyeIcons[0]);
      expect($.fn.modal).toHaveBeenCalledWith("show");
      const modal = document.querySelector("#modaleFile");
      expect(modal).toBeTruthy();
      const modalImg = modal.querySelector("img");
      expect(modalImg).toBeTruthy();
    });
  });
});

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      const billsTable = screen.getByTestId("tbody");
      expect(billsTable).toBeTruthy();
      const newBillBtn = screen.getByTestId("btn-new-bill");
      expect(newBillBtn).toBeTruthy();
    });

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });

      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});