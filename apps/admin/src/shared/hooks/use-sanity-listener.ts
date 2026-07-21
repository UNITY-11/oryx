import { useEffect, useRef } from "react";
import { sanityPublicClient } from "../lib/sanity/client-public";

/**
 * A hook to listen to real-time Sanity updates for a given GROQ query.
 * Automatically handles subscribing and unsubscribing.
 *
 * @param query The GROQ query to listen to (e.g. '*[_type == "notification"]')
 * @param onUpdate The callback to execute when an update is received
 */
export function useSanityListener(query: string, onUpdate: () => void) {
  // Use a ref to store the latest callback so we don't re-subscribe on every render
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const subscription = sanityPublicClient.listen(query).subscribe(() => {
      // Trigger the latest callback
      onUpdateRef.current();
    });

    return () => {
      // Properly unsubscribe to prevent memory leaks and redundant API calls
      subscription.unsubscribe();
    };
  }, [query]);
}
