import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      catalog: "Catalog",
      profile: "Profile",
      admin: "Admin Panel",
      language: "Language",
      theme: "Theme",
      dark_mode: "Dark Mode",
      light_mode: "Light Mode",
      share_contact: "Share Phone Number",
      no_products: "No products available.",
      price: "Price",
      add_category: "Add Category",
      add_product: "Add Product",
      name: "Name",
      description: "Description",
      base_price: "Base Price",
      save: "Save",
      visible: "Visible on Landing",
      phone_number: "Phone Number"
    }
  },
  fa: {
    translation: {
      catalog: "کاتالوگ",
      profile: "پروفایل",
      admin: "پنل ادمین",
      language: "زبان",
      theme: "پوسته",
      dark_mode: "حالت تاریک",
      light_mode: "حالت روشن",
      share_contact: "اشتراک شماره تماس",
      no_products: "محصولی موجود نیست.",
      price: "قیمت",
      add_category: "افزودن دسته بندی",
      add_product: "افزودن محصول",
      name: "نام",
      description: "توضیحات",
      base_price: "قیمت پایه",
      save: "ذخیره",
      visible: "نمایش در صفحه اصلی",
      phone_number: "شماره تماس"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "fa", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
