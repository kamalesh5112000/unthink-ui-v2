import React, { useCallback, useEffect, useState } from 'react'
import { CloseOutlined } from "@ant-design/icons";
import { GuestPopUpShow } from './redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import popupStyles from '../auraResponseProductsWithTags/chatSuggestionsWithProducts.module.scss'
import styles from './authPage.module.scss'


function GuestPopUp({
    handleGuestSubmit,
    errors,
    handleGuestSkip,
    guestChange,
    guestData,
    setIsPopupShow,
    onClose,
    showSkip,
    overlayStyle,
}) {

    const dispatch = useDispatch()
    const [ storeData] = useSelector((state) => [
        state.store.data,
      ]);

    const handClose = () => {
        if (onClose) {
            onClose()
            return
        }
        dispatch(GuestPopUpShow(false))
        setIsPopupShow(false)
    }

    const hasPhoneWithoutEmail = guestData.phone?.trim() && !guestData.email?.trim()
    const emailError = hasPhoneWithoutEmail ? "" : errors.email

    return (
        <form onSubmit={handleGuestSubmit} className={popupStyles['popup-overlay']} style={overlayStyle}>
            <div className={popupStyles['popup-content']}>
                <div className={styles.guestHeader}>
                    <h2 className={styles.guestTitle}>
                        Please provide your email or phone number to ensure your collections are saved and accessible whenever you return.
                    </h2>
                    <CloseOutlined
                        className={styles.guestCloseIcon}
                        onClick={handClose}
                    />
                </div>
                <div>
                    <label className={styles.guestLabel}>Email Address</label>
                    <input
                        className={`${styles.guestInput} ${emailError ? styles.guestInputError : ""}`}
                        name="email"
                        type="text"
                        placeholder="Email Address"
                        value={guestData.email}
                        onChange={guestChange}
                    />
                    {emailError && <p className={styles.guestErrorText}>{emailError}</p>}
                </div>
                <div className={styles.guestField}>
                    <label className={styles.guestLabel}>Phone Number</label>
                    <input
                        className={`${styles.guestInput} ${errors.phone ? styles.guestInputError : ""}`}
                        name="phone"
                        type="tel"
                        placeholder="Phone Number"
                        value={guestData.phone || ""}
                        onChange={guestChange}
                    />
                    {errors.phone && <p className={styles.guestErrorText}>{errors.phone}</p>}
                </div>
                <div>
                    <div className={styles.guestActions}>
                        <button
                            type="submit"
                            className={styles.guestButton}
                        >
                            Ok
                        </button>
                        {(showSkip ?? storeData?.share_settings?.is_skip_enabled) &&
                        <button
                            className={styles.guestButton}
                            onClick={handleGuestSkip}
                        >
                            Skip
                        </button>
                            }
                    </div>
                </div>
            </div>
        </form>
    )
}

export default GuestPopUp
