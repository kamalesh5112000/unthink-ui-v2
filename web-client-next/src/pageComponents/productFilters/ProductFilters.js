// not using
import React from "react";
import { useSelector } from "react-redux";
import { Select, Checkbox, Input } from "antd";

import { current_store_name } from "../../constants/config";
import { STORE_USER_NAME_HOMECENTRE } from "../../constants/codes";
import { isEmpty, isValidNumber } from "../../helper/utils";

// styles moved to Tailwind; removed productFilters.module.scss import

const { Option } = Select;

export const ProductFilters = ({
	productFilters,
	handleFiltersInputChange,
	handleFiltersOptionalChange,
}) => {
	const [storeData] = useSelector((state) => [state.store.data]);

	const { filter_settings } = storeData;

	const availableFilters = filter_settings?.available_filters;
	const displayFilters = filter_settings?.display_filters || [];

	const displayableFilter = displayFilters?.map((v) => v.key);

	const handlePriceChange = (name, value) => {
		if (isValidNumber(value) || value === "") {
			handleFiltersInputChange("price", {
				...productFilters?.price,
				[name]: value ? parseInt(value) : undefined,
			});
		}
	};

	return (
		<div>
			<div className='grid grid-cols-1 tablet:grid-cols-2 2xl:grid-cols-3 gap-4'>
				{displayableFilter.includes("gender") &&
					availableFilters?.gender?.length ? (
					<div>
						<div className='flex justify-between mb-0.75'>
							<label className='text-base text-slate-200 block'>Gender</label>
							<div className='flex items-center'>
								<label className='text-slate-200 block mr-1'>Optional</label>
								<Checkbox
									className='text-slate-200 [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-[var(--color-secondary)] [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-[var(--color-secondary)] hover:[&_.ant-checkbox-inner]:border-[var(--color-secondary)]'
									onChange={() => handleFiltersOptionalChange("gender")}
									checked={productFilters?.optional_filters?.includes(
										"gender"
									)}></Checkbox>
							</div>
						</div>
						<Select
							mode='multiple'
							name='gender'
							className='w-full text-base product-filters-select-input [&:hover_.ant-select-selector]:!border-[var(--color-secondary)] [&.ant-select-focused_.ant-select-selector]:!border-[var(--color-secondary)] [&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-secondary)_20%,transparent)]'
							placeholder='Select gender'
							value={productFilters?.gender || []}
							size='large'
							onChange={(values) =>
								handleFiltersInputChange(
									"gender",
									!isEmpty(values) ? values : undefined
								)
							}>
							{availableFilters?.gender.map((g) => (
								<Option value={g}>{g}</Option>
							))}
						</Select>
					</div>
				) : null}

				{displayableFilter.includes("age_group") &&
					availableFilters?.age_group?.length ? (
					<div>
						<div className='flex justify-between mb-0.75'>
							<label className='text-base text-slate-200 block'>Age group</label>
							<div className='flex items-center'>
								<label className='text-slate-200 block mr-1'>Optional</label>
								<Checkbox
									className='text-slate-200 '
									onChange={() => handleFiltersOptionalChange("age_group")}
									checked={productFilters?.optional_filters?.includes(
										"age_group"
									)}></Checkbox>
							</div>
						</div>
						<Select
							mode='multiple'
							name='age_group'
							className='w-full text-base product-filters-select-input [&:hover_.ant-select-selector]:!border-[var(--color-secondary)] [&.ant-select-focused_.ant-select-selector]:!border-[var(--color-secondary)] [&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-secondary)_20%,transparent)]'
							placeholder='Select age group'
							value={productFilters?.age_group || []}
							size='large'
							onChange={(values) =>
								handleFiltersInputChange(
									"age_group",
									!isEmpty(values) ? values : undefined
								)
							}>
							{availableFilters?.age_group.map((a) => (
								<Option value={a}>{a}</Option>
							))}
						</Select>
					</div>
				) : null}

				{displayableFilter.includes("discount") &&
					availableFilters?.discount?.length ? (
					<div>
						<div className='flex justify-between mb-0.75'>
							<label className='text-base text-slate-200 block'>Discount</label>
							<div className='flex items-center'>
								<label className='text-slate-200 block mr-1'>Optional</label>
								<Checkbox
									className='text-slate-200 [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-[var(--color-secondary)] [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-[var(--color-secondary)] hover:[&_.ant-checkbox-inner]:border-[var(--color-secondary)]'
									onChange={() => handleFiltersOptionalChange("discount")}
									checked={productFilters?.optional_filters?.includes(
										"discount"
									)}></Checkbox>
							</div>
						</div>
						<Select
							mode='multiple'
							className='w-full text-base product-filters-select-input [&:hover_.ant-select-selector]:!border-[var(--color-secondary)] [&.ant-select-focused_.ant-select-selector]:!border-[var(--color-secondary)] [&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-secondary)_20%,transparent)]'
							placeholder='Select discount'
							value={productFilters?.discount || []}
							size='large'
							onChange={(values) =>
								handleFiltersInputChange(
									"discount",
									!isEmpty(values) ? values : undefined
								)
							}>
							{availableFilters?.discount.map((filter) => (
								<Option value={filter} key={filter}>
									{filter}
								</Option>
							))}
						</Select>
					</div>
				) : null}

				{displayableFilter.includes("brand") &&
					availableFilters?.brand?.length ? (
					<div>
						<div className='flex justify-between mb-0.75'>
							<label className='text-base text-slate-200 block'>Seller</label>
							<div className='flex items-center'>
								<label className='text-slate-200 block mr-1'>Optional</label>
								<Checkbox
									className='text-slate-200 [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-[var(--color-secondary)] [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-[var(--color-secondary)] hover:[&_.ant-checkbox-inner]:border-[var(--color-secondary)]'
									onChange={() => handleFiltersOptionalChange("brand")}
									checked={productFilters?.optional_filters?.includes(
										"brand"
									)}></Checkbox>
							</div>
						</div>
						<Select
							mode='multiple'
							className='w-full text-base product-filters-select-input [&:hover_.ant-select-selector]:!border-[var(--color-secondary)] [&.ant-select-focused_.ant-select-selector]:!border-[var(--color-secondary)] [&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-secondary)_20%,transparent)]'
							placeholder='Select seller brands'
							onChange={(values) =>
								handleFiltersInputChange(
									"brand",
									!isEmpty(values) ? values : undefined
								)
							}
							value={productFilters?.brand || []}
							size='large'>
							{availableFilters?.brand.map((filter) => (
								<Option value={filter} key={filter}>
									{filter}
								</Option>
							))}
						</Select>
					</div>
				) : null}

				{displayableFilter.includes("color") ? (
					<div>
						<div className='flex justify-between mb-0.75'>
							<label className='text-base text-slate-200 block'>Color</label>
							<div className='flex items-center'>
								<label className='text-slate-200 block mr-1'>Optional</label>
								<Checkbox
									className='text-slate-200 [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-[var(--color-secondary)] [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-[var(--color-secondary)] hover:[&_.ant-checkbox-inner]:border-[var(--color-secondary)]'
									onChange={() => handleFiltersOptionalChange("color")}
									checked={productFilters?.optional_filters?.includes(
										"color"
									)}></Checkbox>
							</div>
						</div>
						<Select
							mode='tags'
							className='w-full text-base product-filters-select-input [&:hover_.ant-select-selector]:!border-[var(--color-secondary)] [&.ant-select-focused_.ant-select-selector]:!border-[var(--color-secondary)] [&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-secondary)_20%,transparent)]'
							placeholder='Enter color'
							value={productFilters?.color || []}
							size='large'
							onChange={(values) =>
								handleFiltersInputChange(
									"color",
									!isEmpty(values) ? values : undefined
								)
							}
							dropdownStyle={{ display: "none" }}></Select>
					</div>
				) : null}

				{displayableFilter.includes("occasion") ? (
					<div>
						<div className='flex justify-between mb-0.75'>
							<label className='text-base text-slate-200 block'>
								{current_store_name === STORE_USER_NAME_HOMECENTRE
									? "Room"
									: "Occasion"}
							</label>
							<div className='flex items-center'>
								<label className='text-slate-200 block mr-1'>Optional</label>
								<Checkbox
									className='text-slate-200 [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-[var(--color-secondary)] [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-[var(--color-secondary)] hover:[&_.ant-checkbox-inner]:border-[var(--color-secondary)]'
									onChange={() => handleFiltersOptionalChange("occasion")}
									checked={productFilters?.optional_filters?.includes(
										"occasion"
									)}></Checkbox>
							</div>
						</div>
						<Select
							mode='tags'
							className='w-full text-base product-filters-select-input [&:hover_.ant-select-selector]:!border-[var(--color-secondary)] [&.ant-select-focused_.ant-select-selector]:!border-[var(--color-secondary)] [&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-secondary)_20%,transparent)]'
							placeholder='Enter occasion'
							value={productFilters?.occasion || []}
							size='large'
							onChange={(values) =>
								handleFiltersInputChange(
									"occasion",
									!isEmpty(values) ? values : undefined
								)
							}>
							{availableFilters?.occasion?.map((filter) => (
								<Option value={filter} key={filter}>
									{filter}
								</Option>
							))}
						</Select>
					</div>
				) : null}

				{/* {displayableFilter.includes("custom_filter") ? (
					<div>
						<div className='flex justify-between mb-0.75'>
							<label className='text-base text-slate-200 block'>
								Custom filter{" "}
								<span className='text-sm'>(max 25 characters)</span>
							</label>
							<div className='flex items-center'>
								<label className='text-slate-200 block mr-1'>Optional</label>
								<Checkbox
									className='text-slate-200 [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-[var(--color-secondary)] [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-[var(--color-secondary)] hover:[&_.ant-checkbox-inner]:border-[var(--color-secondary)]'
									onChange={() => handleFiltersOptionalChange("custom_filter")}
									checked={productFilters?.optional_filters?.includes(
										"custom_filter"
									)}></Checkbox>
							</div>
						</div>
						<Input
							className='outline-none px-3 h-10 bg-slate-100 rounded-xl w-full'
							placeholder='Enter custom filter'
							name='custom_filter'
							value={productFilters?.custom_filter || ""}
							onChange={(e) =>
								handleFiltersInputChange(
									"custom_filter",
									!isEmpty(e.target.value) ? e.target.value : undefined
								)
							}
							maxLength={25}
						/>
					</div>
				) : null} */}

				{displayableFilter.includes("price") ? (
					<div>
						<div className='flex justify-between mb-0.75'>
							<label className='text-base text-slate-200 block'>
								Price range
							</label>
							<div className='flex items-center'>
								<label className='text-slate-200 block mr-1'>Optional</label>
								<Checkbox
									className='text-slate-200 [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-[var(--color-secondary)] [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-[var(--color-secondary)] hover:[&_.ant-checkbox-inner]:border-[var(--color-secondary)]'
									onChange={() => handleFiltersOptionalChange("price")}
									checked={productFilters?.optional_filters?.includes(
										"price"
									)}></Checkbox>
							</div>
						</div>
						<div className='flex flex-row'>
							<Input
								type='text'
								className='outline-none px-3 h-10 bg-slate-100 rounded-xl w-full'
								placeholder='Minimum'
								value={productFilters?.price?.min || ""}
								onChange={(e) => handlePriceChange("min", e.target.value)}
								name='priceRange-min'
							/>
							<span className='flex justify-center items-center text-slate-200 text-base mx-5'>
								to
							</span>
							<Input
								type='text'
								className='outline-none px-3 h-10 bg-slate-100 rounded-xl w-full'
								placeholder='Maximum'
								value={productFilters?.price?.max || ""}
								onChange={(e) => handlePriceChange("max", e.target.value)}
								name='priceRange-max'
							/>
						</div>
					</div>
				) : null}

				{displayableFilter.includes("material") ? (
					<div>
						<div className='flex justify-between mb-0.75'>
							<label className='text-base text-slate-200 block'>Material</label>
							<div className='flex items-center'>
								<label className='text-slate-200 block mr-1'>Optional</label>
								<Checkbox
									className='text-slate-200 [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-[var(--color-secondary)] [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-[var(--color-secondary)] hover:[&_.ant-checkbox-inner]:border-[var(--color-secondary)]'
									onChange={() => handleFiltersOptionalChange("material")}
									checked={productFilters?.optional_filters?.includes(
										"material"
									)}></Checkbox>
							</div>
						</div>
						<Select
							mode='tags'
							className='w-full text-base product-filters-select-input [&:hover_.ant-select-selector]:!border-[var(--color-secondary)] [&.ant-select-focused_.ant-select-selector]:!border-[var(--color-secondary)] [&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-secondary)_20%,transparent)]'
							placeholder={`Enter material`}
							value={productFilters?.material || []}
							size='large'
							onChange={(values) =>
								handleFiltersInputChange(
									"material",
									!isEmpty(values) ? values : undefined
								)
							}
							dropdownStyle={{ display: "none" }}></Select>
					</div>
				) : null}

				{displayableFilter.includes("pattern") &&
					availableFilters?.pattern?.length ? (
					<div>
						<div className='flex justify-between mb-0.75'>
							<label className='text-base text-slate-200 block'>Pattern</label>
							<div className='flex items-center'>
								<label className='text-slate-200 block mr-1'>Optional</label>
								<Checkbox
									className='text-slate-200 [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-[var(--color-secondary)] [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-[var(--color-secondary)] hover:[&_.ant-checkbox-inner]:border-[var(--color-secondary)]'
									onChange={() => handleFiltersOptionalChange("pattern")}
									checked={productFilters?.optional_filters?.includes(
										"pattern"
									)}></Checkbox>
							</div>
						</div>
						<Select
							mode='multiple'
							name='pattern'
							className='w-full text-base product-filters-select-input [&:hover_.ant-select-selector]:!border-[var(--color-secondary)] [&.ant-select-focused_.ant-select-selector]:!border-[var(--color-secondary)] [&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-secondary)_20%,transparent)]'
							placeholder='Select pattern'
							value={productFilters?.pattern || []}
							size='large'
							onChange={(values) =>
								handleFiltersInputChange(
									"pattern",
									!isEmpty(values) ? values : undefined
								)
							}>
							{availableFilters?.pattern?.map((v) => (
								<Option value={v}>{v}</Option>
							))}
						</Select>
					</div>
				) : null}

				{displayableFilter.includes("style") ? (
					<div>
						<div className='flex justify-between mb-0.75'>
							<label className='text-base text-slate-200 block'>Style</label>
							<div className='flex items-center'>
								<label className='text-slate-200 block mr-1'>Optional</label>
								<Checkbox
									className='text-slate-200 [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-[var(--color-secondary)] [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-[var(--color-secondary)] hover:[&_.ant-checkbox-inner]:border-[var(--color-secondary)]'
									onChange={() => handleFiltersOptionalChange("style")}
									checked={productFilters?.optional_filters?.includes(
										"style"
									)}></Checkbox>
							</div>
						</div>
						<Select
							mode='tags'
							className='w-full text-base product-filters-select-input [&:hover_.ant-select-selector]:!border-[var(--color-secondary)] [&.ant-select-focused_.ant-select-selector]:!border-[var(--color-secondary)] [&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-secondary)_20%,transparent)]'
							placeholder='Enter style'
							onChange={(values) =>
								handleFiltersInputChange(
									"style",
									!isEmpty(values) ? values : undefined
								)
							}
							value={productFilters?.style || []}
							size='large'>
							{availableFilters?.style?.map((filter) => (
								<Option value={filter} key={filter}>
									{filter}
								</Option>
							))}
						</Select>
					</div>
				) : null}

				{displayableFilter.includes("product_brand") &&
					availableFilters?.product_brand?.length ? (
					<div>
						<div className='flex justify-between mb-0.75'>
							<label className='text-base text-slate-200 block'>Brand</label>
							<div className='flex items-center'>
								<label className='text-slate-200 block mr-1'>Optional</label>
								<Checkbox
									className='text-slate-200 [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-[var(--color-secondary)] [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-[var(--color-secondary)] hover:[&_.ant-checkbox-inner]:border-[var(--color-secondary)]'
									onChange={() => handleFiltersOptionalChange("product_brand")}
									checked={productFilters?.optional_filters?.includes(
										"product_brand"
									)}></Checkbox>
							</div>
						</div>
						<Select
							mode='multiple'
							className='w-full text-base product-filters-select-input [&:hover_.ant-select-selector]:!border-[var(--color-secondary)] [&.ant-select-focused_.ant-select-selector]:!border-[var(--color-secondary)] [&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-secondary)_20%,transparent)]'
							placeholder='Select product brand'
							onChange={(values) =>
								handleFiltersInputChange(
									"product_brand",
									!isEmpty(values) ? values : undefined
								)
							}
							value={productFilters?.product_brand || []}
							size='large'>
							{availableFilters?.product_brand?.map((filter) => (
								<Option value={filter} key={filter}>
									{filter}
								</Option>
							))}
						</Select>
					</div>
				) : null}
			</div>
		</div>
	);
};
