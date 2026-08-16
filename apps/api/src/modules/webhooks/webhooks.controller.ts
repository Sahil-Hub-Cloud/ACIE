import { Controller, Post, Headers, Body, UnauthorizedException, HttpCode } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('api/webhooks')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Post('github')
  @HttpCode(200)
  async handleGithubWebhook(
    @Headers('x-hub-signature-256') signature: string,
    @Headers('x-github-event') event: string,
    @Body() payload: any
  ) {
    // 1. Verify GitHub Signature
    const isValid = await this.webhooksService.verifySignature(signature, payload);
    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    // 2. Handle GitHub event
    return this.webhooksService.handleGithubWebhook(event, payload);
  }
}
