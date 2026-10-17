import { PRODUCT_DUMMY_URL } from "../../constants/codes";
import { getPercentage } from "../utils";

export const isProductUrlAvailable = (product) =>
  Boolean(product?.url && product.url !== PRODUCT_DUMMY_URL);

export const normalizeCurrencySymbol = (symbol) => {
  const symbolMap = {
    "&#8377;": "\u20B9",
    "&#x20B9;": "\u20B9",
    "&8377;": "\u20B9",
    "&#36;": "$",
  };

  return symbolMap[symbol] || symbol || "$";
};

export const getProductCurrencySymbol = (product) =>
  normalizeCurrencySymbol(product?.currency_symbol);

export const getProductDiscountPercentage = (product) =>
  product?.price &&
  product?.listprice &&
  +product.listprice > +product.price &&
  getPercentage(product.listprice, product.price);

export const isProductOutOfStock = (product) =>
  String(product?.avlble ?? "").trim() === "0";

export const isProductAvailable = (product) =>
  String(product?.avlble ?? "").trim() === "1";
