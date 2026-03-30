import { WsBannedGuard } from './ws-banned.guard';

describe('WsBannedGuard', () => {
  it('should be defined', () => {
    expect(new WsBannedGuard()).toBeDefined();
  });
});
