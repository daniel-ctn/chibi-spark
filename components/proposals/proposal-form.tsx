"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "@/components/site/theme-provider";
import Turnstile from "react-turnstile";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { proposalSchema, type ProposalInput } from "@/lib/validators/proposals";
import { submitProposal } from "@/features/proposals/actions";
import { env } from "@/lib/env";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ProposalForm() {
  const { resolvedTheme } = useTheme();
  const siteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const form = useForm<ProposalInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(proposalSchema) as any,
    defaultValues: {
      nickname: "",
      ideaText: "",
      styleHints: "",
      turnstileToken: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: ProposalInput) {
    const result = await submitProposal(data);

    if (result.success) {
      toast.success("Your idea has been submitted! Thank you for contributing.");
      form.reset();
    } else {
      toast.error(result.error ?? "Submission failed");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nickname (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Anonymous chibi fan" maxLength={50} {...field} />
              </FormControl>
              <FormDescription>
                Leave blank to stay anonymous. Max 50 characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ideaText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your chibi idea</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your chibi idea... (e.g., 'a wizard cat with a glowing staff')"
                  maxLength={500}
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Be creative! 3-500 characters. {field.value?.length ?? 0}/500
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="styleHints"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Style hints (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., pastel colors, cyberpunk, cozy"
                  maxLength={200}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Any specific style preferences? Max 200 characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="turnstileToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification</FormLabel>
              <FormControl>
                {siteKey ? (
                  <Turnstile
                    sitekey={siteKey}
                    onVerify={(token) => field.onChange(token)}
                    onExpire={() => field.onChange("")}
                    theme={resolvedTheme}
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Verification not configured (dev mode)
                  </p>
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit idea
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
