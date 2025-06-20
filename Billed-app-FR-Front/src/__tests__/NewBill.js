/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage";
import mockStore from "../__mocks__/store";
import router from "../app/Router";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({ type: "Employee", email: "a@a" })
    );
    document.body.innerHTML = "";
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
    window.onNavigate(ROUTES_PATH.NewBill);
  });

  describe("When I am on NewBill Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      const windowIcon = screen.getByTestId("icon-mail");
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
    });
  });

  describe("When I submit a new Bill", () => {
    beforeEach(() => {
      global.alert = jest.fn(); // Simulate alert
      window.onNavigate(ROUTES_PATH.NewBill);
    });

    test("Then the bill is saved", async () => {
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

    test("Then the bill of the file is correct", async () => {
      const initBill = new NewBill({
        document,
        onNavigate,
      });

      const file = new File(["image"], "image.png", { type: "image/png" });
      // Check if handleChangeFile is called when change
      const handleChangeFile = jest.fn((e) => initBill.handleChangeFile(e));
      const formNewBill = screen.getByTestId("form-new-bill");
      const billFile = screen.getByTestId("file");

      billFile.addEventListener("change", handleChangeFile);
      userEvent.upload(billFile, file);

      expect(billFile.files[0].name).toBeDefined();
      expect(handleChangeFile).toBeCalled();

      const handleSubmit = jest.fn((e) => initBill.handleSubmit(e));
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    });

    test("Then the bill of the file is incorrect", async () => {
      const billFile = screen.getByTestId("file");
      const badFile = new File(["text"], "badfile.pdf", {
        type: "application/pdf",
      });

      userEvent.upload(billFile, badFile);
      expect(global.alert).toHaveBeenCalledWith(
        "Type de fichier non valide. Veuillez déposer un fichier JPG, JPEG ou PNG."
      );
    });
  });
});

// test d'intégration POST
describe("Given I navigate to employee page", () => {
  describe("When I am connected as an employee and I create new bill", () => {
    test("Then employee create new bill", async () => {
      const postSpy = jest.spyOn(mockStore, "bills");
      const bill = {
        id: "47qAXb6fIm2zOKkLzMro",
        vat: "80",
        fileUrl:
          "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "séminaire billed",
        name: "encore",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        date: "2004-04-04",
        amount: 400,
        commentAdmin: "ok",
        email: "a@a",
        pct: 20,
      };
      const postBills = await mockStore.bills().update(bill);
      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postBills).toStrictEqual(bill);
    });

    const errorTest = async (errorMessage) => {
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      const postSpy = jest.spyOn(console, "error");

      const store = {
        bills: jest.fn(() => newBill.store),
        create: jest.fn(() => Promise.resolve({})),
        update: jest.fn(() => Promise.reject(new Error(errorMessage))),
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });
      newBill.isImgFormatValid = true;

      // Submit form
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener(
        "submit",
        jest.fn((e) => newBill.handleSubmit(e))
      );

      fireEvent.submit(form);
      await new Promise(process.nextTick);
      expect(postSpy).toBeCalledWith(new Error(errorMessage));
    };

    describe("When an error occurs on API", () => {
      test("Then add bill from an API and fail with a 404 error", async () => {
        await errorTest("404");
      });

      test("Then add bill from an API and fail with a 500 error", async () => {
        await errorTest("500");
      });
    });
  });
});