import React, { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { CloseOutlined } from "@ant-design/icons";
import styles from "./Modal.module.css";

import {
	makeBodyOverflowHidden,
	makeBodyOverflowUnset,
} from "../../helper/utils";

const unthinkNextGenModalClass = "un-next-gen-modal";

const Modal = ({
	isOpen,
	children,
	onClose,
	maskClosable = true,
	size = "md",
	headerText,
	subText,
	subTextClassName = styles.subTextDefault,
	contentWrapperSpacingClassName = styles.contentSpacingDefault,
	zIndexClassName = styles.zIndex40,
	headerTextSpacingClassName = styles.headerTextSpacingDefault,
	headerTextClassName = styles.headerTextDefault,
	closeClassName = styles.textSizeXl1_5,
	zIndex = 50,
}) => {

	const [showChatModal, showWishlistModal] = useSelector((state) => [
		state.chatV2.showChatModal,
		state.appState.wishlist.showWishlistModal,
	]); // modals isOpen states which are completely custom and handled by redux, using it to manage body scroll Behavior

	useEffect(() => {
		if (isOpen) {
			makeBodyOverflowHidden();

			return () => {
				if (
					// make the body overflow unset only when this will the last modal
					window?.document?.getElementsByClassName(unthinkNextGenModalClass)
						?.length === 0 &&
					!showChatModal &&
					!showWishlistModal
				) {
					makeBodyOverflowUnset();
				}
			};
		}

		return () => { };
	}, [isOpen]);

	const maxWidthClassName = useMemo(() => {
		switch (size) {
			case "xs":
				return styles.sizeXs;

			case "sm":
				return styles.sizeSm;

			case "x-sm":
				return styles.sizeXSm;

			case "md":
			default:
				return styles.sizeMd;
		}
	}, [size]);

	const showHeader = useMemo(
		() => headerText || onClose,
		[headerText, onClose]
	);

	if (isOpen) {
		const modalNode = (
			<div style={{ zIndex }}
				// unthinkNextGenModalClass class added to handle body overflow scroll bar
				className={`${unthinkNextGenModalClass} ${styles.modalOverlay} ${zIndexClassName}`}
				onClick={() => maskClosable && onClose && onClose()}>
				<div aria-hidden='true' className={styles.modalBackdrop} />
				<div
					className={`${styles.modalContentWrapper} ${maxWidthClassName}`}
					onClick={(e) => e.stopPropagation()} // to avoid click on backDrop // prevent bubbling
				>
					<div className={styles.modalContentInner}>
						{showHeader ? (
							<div
								className={`${styles.modalHeader} ${headerTextSpacingClassName} ${subText ? styles.modalHeaderItemsStart : styles.modalHeaderItemsCenter}`}>
								<div>
									{headerText && (
										<h2 className={`${headerTextClassName}`}>{headerText}</h2>
									)}
									{subText && (
										<p className={`${subTextClassName}`}>{subText}</p>
									)}
								</div>
								<div className={styles.closeWrapper}>
									{onClose && (
										<CloseOutlined
											onClick={onClose}
											className={`close ${styles.closeBase} ${closeClassName}`}
											role='button'
										/>
									)}
								</div>
							</div>
						) : null}
						<div
							className={`${styles.modalBody} ${showHeader ? styles.roundedBottom : styles.roundedAll
								} ${contentWrapperSpacingClassName}`}>
							{children}
						</div>
					</div>
				</div>
			</div>
		);

		if (typeof window !== "undefined" && window?.document?.body) {
			return createPortal(modalNode, window.document.body);
		}

		return modalNode;
	}

	return null;
};

export default React.memo(Modal);
