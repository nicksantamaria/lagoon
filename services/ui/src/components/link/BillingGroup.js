import Link from 'next/link';

export const getLinkData = billingGroupSlug => ({
  urlObject: {
    pathname: '/admin/billingGroup',
    query: { billingGroupName: billingGroupSlug }
  },
  asPath: `/admin/billingGroup/${billingGroupSlug}`
});

/**
 * Links to the billingGroup page given the billingGroup name.
 */
const BillingGroupLink = ({
  billingGroupSlug,
  children,
  className = null,
  prefetch = false
}) => {
  const linkData = getLinkData(billingGroupSlug);

  return (
    <Link href={linkData.urlObject} as={linkData.asPath} prefetch={prefetch}>
      <a className={className}>{children}</a>
    </Link>
  );
};

export default BillingGroupLink;
