import { listAmphures, listProvinces, listTambons } from "thaizip";
import { loadDefaultIndex } from "thaizip/data";

const index = await loadDefaultIndex();

export function fieldsToAddress({ province, district, subdistrict, postalCode }) {
  if (!province || !district || !subdistrict || !postalCode) return null;

  const selectedProvince = listProvinces(index).find((item) => item.nameEn === province);
  const selectedDistrict = selectedProvince && listAmphures(index, selectedProvince.id)
    .find((item) => item.nameTh === district);
  const selectedSubdistrict = selectedDistrict && listTambons(index, selectedDistrict.id)
    .find((item) => item.nameTh === subdistrict && item.zipCode === postalCode);
  if (!selectedProvince || !selectedDistrict || !selectedSubdistrict) return null;

  return {
    province: selectedProvince.nameTh,
    provinceEn: selectedProvince.nameEn,
    district: selectedDistrict.nameTh,
    districtEn: selectedDistrict.nameEn,
    subdistrict: selectedSubdistrict.nameTh,
    subdistrictEn: selectedSubdistrict.nameEn,
    zipCode: selectedSubdistrict.zipCode,
    postalCode: selectedSubdistrict.zipCode,
  };
}

export function addressToFields(address) {
  return {
    province: address?.provinceEn ?? "",
    district: address?.district ?? "",
    subdistrict: address?.subdistrict ?? "",
    postalCode: address?.zipCode ?? "",
  };
}

export function isValidLocation(fields) {
  return Boolean(fieldsToAddress(fields));
}
