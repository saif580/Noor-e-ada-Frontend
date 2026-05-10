import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { accountApi, addressToPayload, type AddressPayload, type UpdateProfilePayload } from '../../api/account';
import { ErrorState, LoadingState, SuccessState } from '../../components/ui/AsyncState';
import { FormField } from '../../components/ui/FormField';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../lib/apiClient';
import type { Address, User } from '../../types/domain';

const emptyAddress: AddressPayload = {
  label: 'Home',
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  isDefaultShipping: false,
  isDefaultBilling: false,
};

const profileToPayload = (profile: User): UpdateProfilePayload => ({
  firstName: profile.firstName,
  lastName: profile.lastName,
  phone: profile.phone ?? '',
  isMarketingOptIn: Boolean(profile.isMarketingOptIn),
});

const errorMessage = (err: unknown) =>
  err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';

export function AccountPage() {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState<User | null>(user);
  const [profileDraft, setProfileDraft] = useState<UpdateProfilePayload>(() =>
    user ? profileToPayload(user) : { firstName: '', lastName: '', phone: '', isMarketingOptIn: false },
  );
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressDraft, setAddressDraft] = useState<AddressPayload>(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressActionId, setAddressActionId] = useState<string | null>(null);

  const loadAccount = useCallback(async () => {
    await Promise.resolve();
    setError('');
    try {
      const [freshProfile, freshAddresses] = await Promise.all([
        accountApi.getProfile(),
        accountApi.listAddresses(),
      ]);
      setProfile(freshProfile);
      setProfileDraft(profileToPayload(freshProfile));
      setAddresses(freshAddresses);
      updateUser(freshProfile);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      void loadAccount();
    }, 0);

    return () => globalThis.clearTimeout(timer);
  }, [loadAccount]);

  const updateProfileDraft = (field: keyof UpdateProfilePayload, value: string | boolean) => {
    setProfileDraft((current) => ({ ...current, [field]: value }));
  };

  const updateAddressDraft = (field: keyof AddressPayload, value: string | boolean) => {
    setAddressDraft((current) => ({ ...current, [field]: value }));
  };

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    setSavingProfile(true);
    setError('');
    setSuccess('');

    try {
      const updatedProfile = await accountApi.updateProfile(profileDraft);
      setProfile(updatedProfile);
      updateUser(updatedProfile);
      setSuccess('Profile updated.');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAddressSubmit(event: FormEvent) {
    event.preventDefault();
    setSavingAddress(true);
    setError('');
    setSuccess('');

    try {
      if (editingAddressId) {
        await accountApi.updateAddress(editingAddressId, addressDraft);
        setSuccess('Address updated.');
      } else {
        await accountApi.createAddress(addressDraft);
        setSuccess('Address added.');
      }
      setAddressDraft(emptyAddress);
      setEditingAddressId(null);
      const freshAddresses = await accountApi.listAddresses();
      setAddresses(freshAddresses);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSavingAddress(false);
    }
  }

  function startEditAddress(address: Address) {
    setEditingAddressId(address.id);
    setAddressDraft(addressToPayload(address));
    setSuccess('');
  }

  function cancelAddressEdit() {
    setEditingAddressId(null);
    setAddressDraft(emptyAddress);
  }

  async function handleDeleteAddress(addressId: string) {
    setAddressActionId(addressId);
    setError('');
    setSuccess('');
    try {
      await accountApi.deleteAddress(addressId);
      setAddresses((current) => current.filter((address) => address.id !== addressId));
      if (editingAddressId === addressId) cancelAddressEdit();
      setSuccess('Address deleted.');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setAddressActionId(null);
    }
  }

  async function setDefaultAddress(address: Address, field: 'isDefaultShipping' | 'isDefaultBilling') {
    setAddressActionId(address.id);
    setError('');
    setSuccess('');
    try {
      await accountApi.updateAddress(address.id, {
        ...addressToPayload(address),
        [field]: true,
      });
      const freshAddresses = await accountApi.listAddresses();
      setAddresses(freshAddresses);
      setSuccess(field === 'isDefaultShipping' ? 'Default shipping address updated.' : 'Default billing address updated.');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setAddressActionId(null);
    }
  }

  if (loading) {
    return (
      <section className="account-page">
        <LoadingState title="Loading account" message="Fetching your profile and address book." />
      </section>
    );
  }

  if (error && !profile) {
    return (
      <section className="account-page">
        <ErrorState title="Account unavailable" message={error} action={{ label: 'Try again', onClick: loadAccount }} />
      </section>
    );
  }

  return (
    <section className="account-page">
      <div className="account-heading">
        <span className="eyebrow">My Noor-e-ada</span>
        <h1>Account</h1>
        <p>Manage your profile, saved delivery addresses, and order activity.</p>
      </div>

      {error && <p className="auth-error account-alert" role="alert">{error}</p>}
      {success && <SuccessState title={success} />}

      <div className="account-grid">
        <form className="account-panel account-form" onSubmit={handleProfileSubmit}>
          <div className="account-panel-heading">
            <h2>Profile</h2>
            <Link to="/orders">View orders</Link>
          </div>

          <div className="auth-form-row">
            <FormField
              label="First name"
              name="firstName"
              value={profileDraft.firstName}
              onChange={(event) => updateProfileDraft('firstName', event.target.value)}
              required
            />
            <FormField
              label="Last name"
              name="lastName"
              value={profileDraft.lastName}
              onChange={(event) => updateProfileDraft('lastName', event.target.value)}
              required
            />
          </div>
          <FormField
            label="Email"
            name="email"
            type="email"
            value={profile?.email ?? ''}
            disabled
          />
          <FormField
            label="Phone"
            name="phone"
            type="tel"
            value={profileDraft.phone}
            onChange={(event) => updateProfileDraft('phone', event.target.value)}
            required
          />
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={Boolean(profileDraft.isMarketingOptIn)}
              onChange={(event) => updateProfileDraft('isMarketingOptIn', event.target.checked)}
            />
            Send me new collection drops, festive edits, and sale alerts.
          </label>
          <button type="submit" className="button button-primary" disabled={savingProfile}>
            {savingProfile ? 'Saving...' : 'Save profile'}
          </button>
        </form>

        <div className="account-panel">
          <div className="account-panel-heading">
            <h2>Address book</h2>
            <span>{addresses.length}/10 saved</span>
          </div>

          <div className="address-list">
            {addresses.length === 0 ? (
              <p className="account-muted">No saved addresses yet.</p>
            ) : (
              addresses.map((address) => (
                <article className="address-card" key={address.id}>
                  <div>
                    <div className="address-card-title">
                      <strong>{address.label}</strong>
                      <span>{[address.isDefaultShipping && 'Shipping', address.isDefaultBilling && 'Billing'].filter(Boolean).join(' / ')}</span>
                    </div>
                    <p>
                      {address.fullName}<br />
                      {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}<br />
                      {address.city}, {address.state} {address.postalCode}<br />
                      {address.country} · {address.phone}
                    </p>
                  </div>
                  <div className="account-actions">
                    <button type="button" onClick={() => startEditAddress(address)}>Edit</button>
                    <button type="button" onClick={() => void setDefaultAddress(address, 'isDefaultShipping')} disabled={addressActionId === address.id || address.isDefaultShipping}>
                      Shipping
                    </button>
                    <button type="button" onClick={() => void setDefaultAddress(address, 'isDefaultBilling')} disabled={addressActionId === address.id || address.isDefaultBilling}>
                      Billing
                    </button>
                    <button type="button" onClick={() => void handleDeleteAddress(address.id)} disabled={addressActionId === address.id}>
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>

      <form className="account-panel account-form address-form" onSubmit={handleAddressSubmit}>
        <div className="account-panel-heading">
          <h2>{editingAddressId ? 'Edit address' : 'Add address'}</h2>
          {editingAddressId && (
            <button type="button" className="account-link-button" onClick={cancelAddressEdit}>
              Cancel edit
            </button>
          )}
        </div>

        <div className="address-form-grid">
          <FormField label="Label" name="label" value={addressDraft.label} onChange={(event) => updateAddressDraft('label', event.target.value)} required />
          <FormField label="Full name" name="fullName" value={addressDraft.fullName} onChange={(event) => updateAddressDraft('fullName', event.target.value)} required />
          <FormField label="Phone" name="addressPhone" type="tel" value={addressDraft.phone} onChange={(event) => updateAddressDraft('phone', event.target.value)} required />
          <FormField label="Address line 1" name="addressLine1" value={addressDraft.addressLine1} onChange={(event) => updateAddressDraft('addressLine1', event.target.value)} required />
          <FormField label="Address line 2" name="addressLine2" value={addressDraft.addressLine2} onChange={(event) => updateAddressDraft('addressLine2', event.target.value)} />
          <FormField label="City" name="city" value={addressDraft.city} onChange={(event) => updateAddressDraft('city', event.target.value)} required />
          <FormField label="State" name="state" value={addressDraft.state} onChange={(event) => updateAddressDraft('state', event.target.value)} required />
          <FormField label="Postal code" name="postalCode" value={addressDraft.postalCode} onChange={(event) => updateAddressDraft('postalCode', event.target.value)} required />
          <FormField label="Country" name="country" value={addressDraft.country} onChange={(event) => updateAddressDraft('country', event.target.value)} required />
        </div>

        <div className="account-checkbox-row">
          <label className="checkbox-field">
            <input type="checkbox" checked={addressDraft.isDefaultShipping} onChange={(event) => updateAddressDraft('isDefaultShipping', event.target.checked)} />
            Default shipping
          </label>
          <label className="checkbox-field">
            <input type="checkbox" checked={addressDraft.isDefaultBilling} onChange={(event) => updateAddressDraft('isDefaultBilling', event.target.checked)} />
            Default billing
          </label>
        </div>

        <button type="submit" className="button button-primary" disabled={savingAddress}>
          {savingAddress ? 'Saving...' : editingAddressId ? 'Update address' : 'Add address'}
        </button>
      </form>
    </section>
  );
}
