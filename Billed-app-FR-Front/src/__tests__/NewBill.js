/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

import NewBillUI from "../views/NewBillUI";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage";
import mockStore from "../__mocks__/store";
import router from "../app/Router";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
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
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      const windowIcon = screen.getByTestId("icon-mail");
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
    });
  });

  describe("When I submit a new Bill", () => {
    test("Then the bill is saved", async () => {
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
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      document.body.innerHTML = NewBillUI();

      const initBill = new NewBill({
        document,
        onNavigate,
      });

      const newBillModal = screen.getByTestId("form-new-bill");
      expect(newBillModal).toBeTruthy();

      const handleSubmit = jest.fn((e) => initBill.handleSubmit(e));
      newBillModal.addEventListener("submit", handleSubmit);
      fireEvent.submit(newBillModal);
      expect(handleSubmit).toHaveBeenCalled();
    });

    test("Then the bill of the file is correct and incorrect", async () => {
      global.alert = jest.fn(); // Simulate alert
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const initBill = new NewBill({
        document,
        onNavigate,
      });

      const file = new File(["image"], "image.png", { type: "image/png" });
      // Check if handleChangeFile is called when change
      const handleChangeFile = jest.fn((e) => initBill.handleChangeFile(e));
      const formNewBill = screen.getByTestId("form-new-bill");
      const billFile = screen.getByTestId("file");
      const badFile = new File(["text"], "badfile.pdf", {
        type: "application/pdf",
      });

      userEvent.upload(billFile, badFile);
      expect(global.alert).toHaveBeenCalledWith(
        "Type de fichier non valide. Veuillez déposer un fichier JPG, JPEG ou PNG."
      );

      billFile.addEventListener("change", handleChangeFile);
      userEvent.upload(billFile, file);

      expect(billFile.files[0].name).toBeDefined();
      expect(handleChangeFile).toBeCalled();

      const handleSubmit = jest.fn((e) => initBill.handleSubmit(e));
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});