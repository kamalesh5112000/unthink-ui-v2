import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Select } from "antd";
import { CheckOutlined, CloseOutlined, PlusOutlined } from "@ant-design/icons";

import { isEmpty } from "../../helper/utils";

export const CustomFilter = ({
	handleSaveEditCustomFilter,
	customFilterStringData = "",
	hashtagsThemeClassName = "text-slate-200",
	customFilter,
	setCustomFilter,
	handleCustomFilterChange,
	isButtonVisible = true,
	isCustomFilterInputVisible = false, // flag for show select box always
	showCustomFilterInput,
	setShowCustomFilterInput,
	checkAndShowContainer,
}) => {
	const [storeData] = useSelector((state) => [state.store.data]);

	const { catalog_attributes = [] } = storeData;

	const savedCustomFilter = useMemo(
		() => (customFilterStringData ? customFilterStringData?.split(",") : []),
		[customFilterStringData]
	);

	const customFilterStoreData = useMemo(
		() => catalog_attributes?.find((c) => c.key === "custom_filter"),
		[catalog_attributes]
	);

	useEffect(() => {
		setCustomFilter(savedCustomFilter);
	}, [customFilterStringData]);

	const closeCustomFilterInput = () => {
		setShowCustomFilterInput(false);
	};

	const handleGoClick = () => {
		closeCustomFilterInput();
		handleSaveEditCustomFilter(customFilter);
	};

	const handleCancelClick = () => {
		closeCustomFilterInput();
		setCustomFilter(savedCustomFilter);
	};

	const handleDeleteCustomFilterClick = (e, hashtag) => {
		e.stopPropagation();

		if (hashtag) {
			const newCustomFilter =
				customFilter?.filter((h) => !hashtag.includes(h)) || [];
			setCustomFilter(newCustomFilter);
			handleSaveEditCustomFilter(newCustomFilter);
		}
	};

	return (
		<>
			<div className='flex flex-col justify-center min-w-0 flex-1'>
				<div className='flex flex-row items-center gap-2.5 w-full'>
					{showCustomFilterInput || isCustomFilterInputVisible ? (
						<>
							<label
								className='font-bold text-sm text-secondary tracking-[0.05em] uppercase underline antialiased self-center shrink-0 whitespace-nowrap'>
								{customFilterStoreData.label}
							</label>
							<div className='flex items-center gap-2 w-full'>
								<div className='flex-1'>
									<Select
										mode='tags'
										className='w-full text-base tag-select-input'
										placeholder={`Enter hashtags`}
										value={customFilter}
										onChange={(value) => handleCustomFilterChange(value)}
										size='large'
										dropdownStyle={{ display: "none" }}
									/>
								</div>
								{isButtonVisible ? (
									<div className='flex items-center gap-2 shrink-0'>
										<button
											onClick={handleGoClick}
											className='flex items-center justify-center text-white rounded-full w-9 h-9 cursor-pointer border-none transition-all hover:scale-105'
											style={{ background: "linear-gradient(90deg, var(--color-secondary) 0%, var(--color-brand) 100%)", boxShadow: "0 2px 8px rgba(114, 104, 236, 0.3)" }}
											title='Apply hashtags'>
											<CheckOutlined className='text-sm' />
										</button>
										<button
											onClick={handleCancelClick}
											className='flex items-center justify-center text-gray-500 rounded-full w-9 h-9 cursor-pointer border border-solid border-gray-200 bg-gray-50 transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-100'
											title='Cancel'>
											<CloseOutlined className='text-xs' />
										</button>
									</div>
								) : null}
							</div>
						</>
					) : (
						<div className='flex items-center flex-wrap gap-2 overflow-auto w-full py-0.5'>
							<label
								className='font-bold text-sm text-secondary tracking-[0.05em] uppercase underline antialiased self-center shrink-0 whitespace-nowrap mr-1'>
								{customFilterStoreData.label}
							</label>
							{!isEmpty(customFilter) ? (
								<>
									{customFilter.map((hashtag) => (
										<div
											key={hashtag}
											className='flex items-center rounded-full bg-[#f3f0ff] border border-solid border-[#e2dcfa] px-3 py-1 text-xs font-semibold text-secondary shadow-sm transition-all hover:bg-[#ece8fb]'
											role='button'>
											<span className='m-0 text-xs font-semibold text-[#2f3d61]'>
												#{hashtag}
											</span>
											<button
												type='button'
												className='border-none bg-transparent p-0 ml-1.5 flex items-center justify-center text-secondary cursor-pointer hover:text-red-500 transition-colors'
												onClick={(e) =>
													handleDeleteCustomFilterClick(e, [hashtag])
												}>
												<CloseOutlined className='text-[10px]' />
											</button>
										</div>
									))}
								</>
							) : null}
							<div
								className='flex items-center justify-center w-7 h-7 rounded-full bg-[#f3f0ff] hover:bg-secondary text-secondary hover:text-white border border-dashed border-secondary transition-all cursor-pointer ml-1'
								title='Add or edit hashtags'
								onClick={() => {
									checkAndShowContainer({ isShowCustomFilterInput: true });
								}}>
								<PlusOutlined className='text-xs flex items-center justify-center' />
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
};


