import { toast } from "sonner";

import { emitCelebration, type CelebrationPayload } from "@/src/lib/celebration";

type ActionSuccessInput = {
  toastMessage: string;
  celebration?: CelebrationPayload;
};

export function actionSuccess(input: ActionSuccessInput) {
  toast.success(input.toastMessage);
  if (input.celebration) {
    emitCelebration(input.celebration);
  }
}

export function actionError(message: string) {
  toast.error(message);
}
